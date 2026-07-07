// Biometric unlock via the platform WebAuthn authenticator (Android
// fingerprint/face, Touch ID, Windows Hello). There's no backend to verify
// a signature against, so — like the PIN — this is a *local device gate*,
// not identity verification: success just means "this device's own
// biometric sensor approved," which is the same trust model as the PIN,
// only stronger and faster to use.
const CREDENTIAL_ID_KEY = "expense-tracker-webauthn-credential-id";

function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

export function hasBiometricRegistered(): boolean {
  return !!localStorage.getItem(CREDENTIAL_ID_KEY);
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function registerBiometric(): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Expense Tracker" },
        user: { id: userId, name: "device-owner", displayName: "Device owner" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;
    localStorage.setItem(CREDENTIAL_ID_KEY, bufferToBase64(credential.rawId));
    return true;
  } catch {
    return false;
  }
}

export async function verifyBiometric(): Promise<boolean> {
  const storedId = localStorage.getItem(CREDENTIAL_ID_KEY);
  if (!storedId) return false;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: "public-key", id: base64ToBuffer(storedId) }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

export function clearBiometric() {
  localStorage.removeItem(CREDENTIAL_ID_KEY);
}
