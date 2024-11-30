package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"net/url"
	"strings"
)

type Response struct {
	EncodedCert     string
	PfxCertPassword string
	PfxCertBlob     string
	DiscoveryUrl    string
	Host            string
}

type WapProvisioningDoc struct {
	XMLName         xml.Name         `xml:"wap-provisioningdoc"`
	Characteristics []Characteristic `xml:"characteristic"`
}

type Characteristic struct {
	Type     string           `xml:"type,attr"`
	Scope    string           `xml:"scope,attr"`
	SubItems []Characteristic `xml:"characteristic"`
	Parms    []Parm           `xml:"parm"`
}

type Parm struct {
	Name  string `xml:"name,attr"`
	Value string `xml:"value,attr"`
}

func GetProvisioningData(packageContent []string) Response {
	pfxCertBlob := GetCertValues(packageContent, "PFXCertBlob", 88, 10)
	pfxCertPassword := GetCertValues(packageContent, "PFXCertPassword", 88, 10)
	encodedCert := GetCertValues(packageContent, "EncodedCertificate", 99, 8)
	discoveryUrl := GetDiscoveryUrl(packageContent)

	parsedUrl, err := url.Parse(discoveryUrl)
	if err != nil {
		log.Println("Error parsing URL:", err)
	}
	host := parsedUrl.Host

	return Response{
		EncodedCert:     encodedCert,
		PfxCertPassword: pfxCertPassword,
		PfxCertBlob:     pfxCertBlob,
		DiscoveryUrl:    discoveryUrl,
		Host:            host,
	}
}

func GetCertValues(lines []string, paramName string, lineStart int, xmlLength int) string {
	selectedLines := lines[lineStart-1 : lineStart-1+xmlLength]
	xmlString := strings.Join(selectedLines, "\n") + "</wap-provisioningdoc>"
	log.Printf(xmlString)

	var wapDoc WapProvisioningDoc
	err := xml.Unmarshal([]byte(xmlString), &wapDoc)
	if err != nil {
		log.Fatal(err)
	}

	for _, char := range wapDoc.Characteristics {
		for _, subChar := range char.SubItems {
			for _, subItem := range subChar.SubItems {
				for _, parm := range subItem.Parms {
					if parm.Name == paramName {
						return parm.Value
					}
				}
			}
		}
	}

	log.Printf("%s not found.", paramName)
	return ""
}

func GetDiscoveryUrl(xmlContent []string) string {
	discoveryXmlString := xmlContent[25]
	wrappedXml := fmt.Sprintf("<Root>%s</Root>", discoveryXmlString)

	var doc struct {
		DiscoveryServiceFullUrl string `xml:"DiscoveryServiceFullUrl"`
	}
	err := xml.Unmarshal([]byte(wrappedXml), &doc)
	if err != nil {
		log.Println("Error parsing discovery URL XML:", err)
		return ""
	}

	if doc.DiscoveryServiceFullUrl != "" {
		return doc.DiscoveryServiceFullUrl
	}

	log.Println("DiscoveryServiceFullUrl not found.")
	return ""
}
