import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule for template-driven forms
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true, // This makes it a standalone component
  imports: [FormsModule, HttpClientModule, JsonPipe, CommonModule], // Import the required modules
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  selectedFile: File | null = null;
  responseData: any = null;

  private simulatorData = {
    "SimulatorSettings": {
      "NumberOfSimulators": 1,
      "LogFile": ".\\Simulators.log",
      "LogLevel": "Information",
      "StorageRoot": ".",
      "HttpClientTimeoutInSeconds": 300,
      "HttpClientMaxConcurrentRequestPerServer": 80
    },
    "DownloadOptions": {
      "DownloadAgentInstaller": false,
      "DownloadAgentConfigFile": false,
      "_comment1": "Choose one of the available modes (Disabled, ProcessWithoutDownload, ProcessWithDownload) in the AppCatalogMode field. Disabled to not support AppCatalog, and others to support with/without download.",
      "AppCatalogMode": "Disabled"
    },
    "CustomDataConfig": {
      "CustomData": {
        "Key1": "Value1",
        "Key2": "Value2"
      }
    },
    "DeviceConfig": {
      "Model": "Surface Pro 9",
      "Manufacturer": "Microsoft",
      "Resolution": {
        "Width": 2880,
        "Height": 1920
      },
      "OSLanguage": "en-CA",
      "DeviceName": "WindowsModern-Simulator",
      "IPRange": {
        "MinIP": "192.168.0.0",
        "MaxIP": "192.168.0.254"
      },
      "CommercializationOperator": "SOTI SIM CARRIER",
      "Programs": [
        {
          "AppId": "Google Chrome",
          "Name": "Google Chrome",
          "Version": "127.0.6533.73",
          "SizeInBytes": 1048576
        },
        {
          "AppId": "Microsoft Edge",
          "Name": "Microsoft Edge",
          "Version": "127.0.2651.74",
          "SizeInBytes": 2097152
        }
      ],
      "AgentVersion": "2025.1.0.0",
      "TrustedRootCertificatesData": [ ""]
    },
    "EnrollmentConfig": {
      "DsAddresses": [
        {
          "Host": "ec2-34-238-24-195.compute-1.amazonaws.com"
        }
      ],
      "EmailAddress": "user1@bdd.soti",
      "Credentials": {
        "Type": "ProvisioningPackage",
        "ProvisioningPackageCredentialsConfig": {
          "ServiceDiscoveryAddress": "",
          "EnrollmentCertificateData": "",
          "EnrollmentCertificatePassword": ""
        }
      }
    }
  };

  // Method to get simulator data
  getSimulatorData() {
    if(this.responseData != null)
    {
      this.simulatorData.EnrollmentConfig.DsAddresses[0].Host = this.responseData.Host;
      this.simulatorData.DeviceConfig.TrustedRootCertificatesData[0] = this.responseData.EncodedCert;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.ServiceDiscoveryAddress = this.responseData.DiscoveryUrl;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.EnrollmentCertificateData = this.responseData.PfxCertBlob;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.EnrollmentCertificatePassword = this.responseData.PfxCertPassword;
    }
    return this.simulatorData;
  }

  constructor(private http: HttpClient) {}
  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file && this.isFileTypeValid(file)) {
      this.selectedFile = file;
    } else {
      alert('Invalid file type. Please select a PPKG file.');
      this.selectedFile = null;
      event.target.value = ''
    }
  }

  isFileTypeValid(file: File): boolean {
    const allowedExtension = '.ppkg';
    return file.name.toLowerCase().endsWith(allowedExtension); 
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    // Send file to Go server
    this.http.post('http://localhost:8080/upload', formData).subscribe(
      (response) => {
        console.log('File uploaded successfully', response);
        this.responseData = response;
      },
      (error) => {
        console.error('Error uploading file', error);
      }
    );
  }

  copyToClipboard(content: any): void {
    const textToCopy = JSON.stringify(content, null, 2); // Convert content to formatted JSON
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Content copied to clipboard!');
  }
}