
interface FingerprintScanResult {
  success: boolean;
  template?: string;
  error?: string;
  quality?: number;
}

interface FingerprintVerifyResult {
  success: boolean;
  matched: boolean;
  confidence?: number;
  error?: string;
}

class FingerprintBridge {
  private baseUrl = 'http://localhost:8081'; // Local bridge service
  private timeout = 10000; // 10 seconds

  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // Quick check
      });
      return response.ok;
    } catch (error) {
      console.log('Fingerprint service not available:', error);
      return false;
    }
  }

  async scanFingerprint(): Promise<FingerprintScanResult> {
    try {
      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Scanner error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fingerprint scan failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async verifyFingerprint(template: string, referenceTemplate: string): Promise<FingerprintVerifyResult> {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          referenceTemplate,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Verification error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fingerprint verification failed:', error);
      return {
        success: false,
        matched: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Fallback simulation for development/testing
  async simulateScan(): Promise<FingerprintScanResult> {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      template: `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quality: Math.floor(Math.random() * 40) + 60, // 60-100 quality
    };
  }
}

export const fingerprintBridge = new FingerprintBridge();
