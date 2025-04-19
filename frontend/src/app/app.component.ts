import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule, JsonPipe, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  selectedFile: File | null = null;
  responseData: any = null;
  obsoleteComment: string = "is obsolete since simulator version 1.10.37"

  private simulatorData = {
    SimulatorSettings: {
      NumberOfSimulators: 1,
      LogFile: '.\\Simulators.log',
      LogLevel: 'Information',
      StorageRoot: '.',
      HttpClientTimeoutInSeconds: 300,
      HttpClientMaxConcurrentRequestPerServer: 80,
      CustomDataFile: '.\\CustomData.json'
    },
    DownloadOptions: {
      DownloadAgentInstaller: false,
      DownloadAgentConfigFile: false,
      _comment_appCatalogMode:
        'Choose one of the available modes (Disabled, ProcessWithoutDownload, ProcessWithDownload) in the AppCatalogMode field. Disabled to not support AppCatalog, and others to support with/without download.',
      AppCatalogMode: 'Disabled',
    },
    _comment_customDataConfig: `CustomDataConfig property ${this.obsoleteComment}. Use CustomDataFile property to set the correct custom data json file path`,
    CustomDataConfig: {
      CustomData: {
        Key1: 'Value1',
        Key2: 'Value2',
      },
    },
    DeviceConfig: {
      Model: 'Surface Pro 9',
      Manufacturer: 'Microsoft',
      Resolution: {
        Width: 2880,
        Height: 1920,
      },
      OSLanguage: 'en-CA',
      DeviceName: 'WindowsModern-Simulator',
      IPRange: {
        MinIP: '192.168.0.0',
        MaxIP: '192.168.0.254',
      },
      MemoryConfig: {
        _commentMemory : "Simulated device memory in MB. One value from the below AvailableMemoryOptions will be randomly chosen as the memory.",
        AvailableMemoryOptions : [1024, 2048, 4096],
        FreeMemoryRange : {
          MinPercentage: 20,
          MaxPercentage: 80
        }
      },
      DiskConfig: {
        _commentDisk : 'Simulated device disk space in GB. One value from the below AvailableDiskOptions will be randomly chosen as the disk space.',
        AvailableDiskOptions : [100, 500, 1000],
        FreeDiskSpaceRange : {
          MinPercentage: 20,
          MaxPercentage: 80
        }
      },
      BatteryConfig: {
        _commentBattery : 'Remaining Simulator battery percentage. One value from the below RemainingBattery will be randomly chosen as the battery percentage.',
        RemainingBatteryRange : {
          MinPercentage: 20,
          MaxPercentage: 80
        }
      },
      CommercializationOperator: 'SOTI SIM CARRIER',
      _comment_sampleThreats: [
        {
          Name: 'Virus1',
          NumberOfDetections: 2,
          Category: 'Worm',
          CurrentStatus: 'Removed',
          Severity: 'High'
        },
        {
          Name: 'Virus2',
          NumberOfDetections: 10,
          Category: 'Spyware',
          CurrentStatus: 'Active',
          Severity: 'Severe'
        }
      ],
      _comment_threatOptions: {
        _comment_category: 'For category choose one of these available modes - (Invalid, Adware, Spyware, PasswordStealer, TrojanDownloader, Worm, Backdoor, RemoteAccessTrojan, Trojan, EmailFlooder, Keylogger, Dialer, MonitoringSoftware, BrowserModifier, Cookie, BrowserPlugin, AOLExploit, Nuker, SecurityDisabler, JokeProgram, HostileActiveXControl, SoftwareBundler, StealthModifier, SettingsModifier, Toolbar, RemoteControlSoftware, TrojanFTP, PotentialUnwantedSoftware, ICQExploit, TrojanTelnet, Exploit, FileSharingProgram, MalwareCreationTool, RemoteControlSoftwareDuplicate, Tool, TrojanDenialOfService, TrojanDropper, TrojanMassMailer, TrojanMonitoringSoftware, TrojanProxyServer, Virus, Known, Unknown, SPP, Behavior, Vulnerability, Policy, EnterpriseUnwantedSoftware, Ransomware, ASRRule)',
        _comment_currentStatus: 'For current status choose on of these available modes- (Active, ActionFailed, ManualStepsRequired, FullScanRequired, RebootRequired, RemediatedWithNoncriticalFailures, Quarantined, Removed, Cleaned, Allowed, NoStatusCleared)',
        _comment_severity: 'For severity choose one of these available modes - (Unknown, Low, Moderate, High, Severe)'
      },
      Threats: [ ],
      Programs: [
        {
          AppId: 'Google Chrome',
          Name: 'Google Chrome',
          Version: '127.0.6533.73',
          SizeInBytes: 1048576,
        },
        {
          AppId: 'Microsoft Edge',
          Name: 'Microsoft Edge',
          Version: '127.0.2651.74',
          SizeInBytes: 2097152,
        },
      ],
      _comment_agentVersion: `AgentVersion property ${this.obsoleteComment}`,
      AgentVersion: '2026.0.0.0',
      TrustedRootCertificatesData: [''],
    },
    EnrollmentConfig: {
      DsAddresses: [
        {
          Host: 'ec2-34-238-24-195.compute-1.amazonaws.com',
        },
      ],
      EmailAddress: 'user1@bdd.soti',
      Credentials: {
        Type: 'ProvisioningPackage',
        ProvisioningPackageCredentialsConfig: {
          ServiceDiscoveryAddress: '',
          EnrollmentCertificateData: '',
          EnrollmentCertificatePassword: '',
        },
      },
    },
  };

  // Method to get simulator data
  getSimulatorData() {
    if (this.responseData != null) {
      this.simulatorData.EnrollmentConfig.DsAddresses[0].Host =
        this.responseData.Host;
      this.simulatorData.DeviceConfig.TrustedRootCertificatesData[0] =
        this.responseData.EncodedCert;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.ServiceDiscoveryAddress =
        this.responseData.DiscoveryUrl;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.EnrollmentCertificateData =
        this.responseData.PfxCertBlob;
      this.simulatorData.EnrollmentConfig.Credentials.ProvisioningPackageCredentialsConfig.EnrollmentCertificatePassword =
        this.responseData.PfxCertPassword;
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
      event.target.value = '';
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
    this.http
      .post(
        'https://provisioning-details-extractor-vercel-backend.vercel.app/upload',
        formData
      )
      .subscribe(
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

  resetData(): void {
    this.responseData = null;
  }
  downloadJson(): void {
    const jsonContent = JSON.stringify(this.getSimulatorData(), null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appsettings.json';
    link.click();
  }
}
