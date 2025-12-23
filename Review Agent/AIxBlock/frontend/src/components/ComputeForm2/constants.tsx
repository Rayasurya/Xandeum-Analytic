export const LABEL_TOOL_INFO = (
  <>
    <strong>Additional info</strong>
    <ul>
      <li>These commands are to install AIxBlock platform docker containers on your server.</li>
      <li>Can be run on a separate, dedicated server</li>
      <li>The verification is to make sure about your server compatibility.</li>
      <li>
        Step by step:
        <ul>
          <li><strong>SSH access into your Server</strong> - Ensure your SSH key is downloaded before running the command on your terminal. (example of command to access server: ssh username@IP address of the server)</li>
          <li><strong>Run Command</strong> – Copy and execute the command on the right box on your terminal.</li>
          <li><strong>Open Ports</strong> – If needed, allow required ports.</li>
          <li><strong>Done!</strong></li>
        </ul>
      </li>
      <li>
        Post-installation steps:
        <ul>
          <li>Run <code>docker ps</code> to check required open ports if needed</li>
          <li>
            Enhance security suggestions:
            <ul>
              <li>Set up SSL certificate</li>
              <li>Implement VPN access</li>
              <li>Configure firewall</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </>
)

export const STORAGE_INFO = (
  <>
    <strong>Additional info</strong>
    <ul>
      <li>These commands auto install and configure your min.io for self-hosted cloud storage on your server.</li>
      <li>Can be run on a separate, dedicated storage server.</li>
      <li>The verification process ensures your server meets min.io's system requirements.</li>
    </ul>
    <strong>Step by step:</strong>
    <ul>
      <li><strong>SSH access into your Server</strong> - Ensure your SSH key is downloaded before running the command on your terminal. (example of command to access server: ssh username@IP address of the server)</li>
      <li><strong>Run Command</strong> – Copy and execute the command on the right box on your terminal.</li>
      <li><strong>Open Ports</strong> – If needed, allow required ports.</li>
      <li><strong>Done!</strong></li>
    </ul>
    <strong>Post-installation steps</strong>
    <ul>
      <li>Run <code>docker ps</code> to check required open ports for min.io</li>
      <li>
        Enhance security:
        <ul>
          <li>Set up SSL certificate for secure access</li>
          <li>Implement access controls (e.g., IAM policies)</li>
          <li>Configure firewall rules if needed</li>
        </ul>
      </li>
      <li>Access the min.io console to manage your storage by using the credentials sent to your email and reset your password.</li>
    </ul>
  </>
)

export const GPU_INFO = (
  <>
    <strong>Additional info</strong>
    <ul>
      <li>These commands integrate your GPUs/CPUs with the AIxBlock platform for your AI training and deployment.</li>
      <li>Can be run on machines with dedicated GPUs or high-performance CPUs.</li>
      <li>The verification process checks hardware compatibility and performance metrics such as CUDA version.</li>
    </ul>
    <strong>Step by step:</strong>
    <ul>
      <li><strong>SSH access into your Server</strong> - Ensure your SSH key is downloaded before running the command on your terminal. (example of command to access server: ssh username@IP address of the server)</li>
      <li><strong>Run Command</strong> – Copy and execute the command on the right box on your terminal.</li>
      <li><strong>Open Ports</strong> – If needed, allow required ports.</li>
      <li><strong>Done!</strong></li>
    </ul>
    <strong>Security measures</strong>
    <ul>
      <li>Implement network isolation for compute nodes</li>
      <li>Set up secure remote access (e.g., SSH with key authentication)</li>
      <li>Configure resource monitoring and alerts</li>
    </ul>
  </>
)
