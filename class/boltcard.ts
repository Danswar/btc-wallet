enum Status {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export default class BoltCard {
  /**
   * Check if the url is a boltcard withdraw url
   * @param payload url
   * @returns boolean
   */
  static isBoltcardWidthdrawUrl(payload: string): boolean {
    return payload.startsWith('lnurlw');
  }

  /**
   *
   * @param lnurlw payload from the nfc tag (Boltcard or similar)
   * @param paymentRequest A ligning invoice
   */
  static async widthdraw(lnurlw: string, paymentRequest: string) {
    try {
      const boltcardUrl = lnurlw.replace('lnurlw', 'https');
      const response = await fetch(boltcardUrl);
      const { callback, k1 }: { callback: string; k1: string } = await response.json();
      const callbackUrl = new URL(callback);
      callbackUrl.searchParams.append('k1', k1);
      callbackUrl.searchParams.append('pr', paymentRequest);
      const callbackResponse = await fetch(callbackUrl.toString());
      const { status, reason }: { status: Status; reason: string } = await callbackResponse.json();
      return { isError: status === Status.ERROR, reason };
    } catch (error: any) {
      return { isError: true, reason: error.message };
    }
  }
}
