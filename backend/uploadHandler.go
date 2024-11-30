package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
)

func uploadFileHandler(w http.ResponseWriter, r *http.Request) {
	fileHeader, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
		return
	}
	defer fileHeader.Close()

	fileContent, err := io.ReadAll(fileHeader)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
		return
	}

	lines := strings.Split(string(fileContent), "\n")
	parsedData := GetProvisioningData(lines)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(parsedData); err != nil {
		log.Println("Error encoding response:", err)
	}
}
