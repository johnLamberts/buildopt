export class MessageFramer {
  /**
   * Encodes a string (or JSON stirng) into a Buffer with 4-byte length prefix
   */
  static encode(payload: string): Buffer {
    const payloadBuffer = Buffer.from(payload, 'utf-8');
    const header = Buffer.alloc(4);


    // Write the length of the payload into the first 4 bytes as a 32-bit big-endian integer
    header.writeInt32BE(payloadBuffer.length, 0);

    // Combine header and payload into one streamable Buffer
    return Buffer.concat([header, payloadBuffer]);
  }


  /**
   * Attempts to extract a complete message from an incoming stream of chunks
   * Returns the message and the remaning buffer, or nukll if incomplete
   */
  static decode(streamBuffer: Buffer): { message: string | null, remaining: Buffer } {
    // We need atleast 4 bytes to even read the Buffer
    if (streamBuffer.length < 4) {
      return { message: null, remaining: streamBuffer };
    }

    const payloadStrength = streamBuffer.readInt32BE(0);
    const totalMessageLength = 4 + payloadStrength;

    // Do we have the full message yet? If not, wait for more data.
    if(streamBuffer.length < totalMessageLength) {
      return { message: null, remaining: streamBuffer };
    }


    // Extract the payload
    const payloadBuffer = streamBuffer.subarray(4, totalMessageLength);
    const message = payloadBuffer.toString("utf-8");

    // Keep whatever is left over for the next cycle
    const remaining = streamBuffer.subarray(totalMessageLength);

    return { message, remaining }
  }
}

