export enum TuspMessageType {
  Init,
  Ack,
  Ping,
  Pong,
  Data,
  End,
  Error,
}

export class TuspPackage {
  sessionId: number = 0;
  messageType: TuspMessageType = TuspMessageType.Init;
  sequenceNumber: number = 0;
  payload: Uint8Array = new Uint8Array();
  headers: Record<string, string> = {};

  get payloadLength(): number {
    return this.payload.length;
  }

  serialize(): Uint8Array {
    const headerEntries = Object.entries(this.headers);

    const headerSectionLength = headerEntries.reduce((acc, [key, value]) => {
      return acc + 2 + Buffer.byteLength(key) + 2 + Buffer.byteLength(value);
    }, 0);

    const bufferArray: Buffer[] = [];

    const sessionBuf = Buffer.alloc(4);
    sessionBuf.writeUInt32LE(this.sessionId);
    bufferArray.push(sessionBuf);

    const typeBuf = Buffer.alloc(4);
    typeBuf.writeInt32LE(this.messageType);
    bufferArray.push(typeBuf);

    const seqBuf = Buffer.alloc(4);
    seqBuf.writeUInt32LE(this.sequenceNumber);
    bufferArray.push(seqBuf);

    const headerCountBuf = Buffer.alloc(4);
    headerCountBuf.writeInt32LE(headerEntries.length);
    bufferArray.push(headerCountBuf);

    const headerLenBuf = Buffer.alloc(4);
    headerLenBuf.writeInt32LE(headerSectionLength);
    bufferArray.push(headerLenBuf);

    for (const [key, value] of headerEntries) {
      const keyBuf = Buffer.from(key, 'utf-8');
      const valBuf = Buffer.from(value, 'utf-8');

      const keyLenBuf = Buffer.alloc(2);
      keyLenBuf.writeUInt16LE(keyBuf.length);
      bufferArray.push(keyLenBuf);
      bufferArray.push(keyBuf);

      const valLenBuf = Buffer.alloc(2);
      valLenBuf.writeUInt16LE(valBuf.length);
      bufferArray.push(valLenBuf);
      bufferArray.push(valBuf);
    }

    const payloadLenBuf = Buffer.alloc(4);
    payloadLenBuf.writeUInt32LE(this.payloadLength);
    bufferArray.push(payloadLenBuf);

    bufferArray.push(Buffer.from(this.payload));

    return Buffer.concat(bufferArray);
  }

  static deserialize(data: Buffer): TuspPackage {
    const pkg = new TuspPackage();
    let offset = 0;

    pkg.sessionId = data.readUInt32LE(offset); offset += 4;
    pkg.messageType = data.readInt32LE(offset); offset += 4;
    pkg.sequenceNumber = data.readUInt32LE(offset); offset += 4;

    const headerCount = data.readInt32LE(offset); offset += 4;
    const headerSectionLength = data.readInt32LE(offset); offset += 4;

    for (let i = 0; i < headerCount; i++) {
      const keyLen = data.readUInt16LE(offset); offset += 2;
      const key = data.toString('utf-8', offset, offset + keyLen); offset += keyLen;

      const valLen = data.readUInt16LE(offset); offset += 2;
      const value = data.toString('utf-8', offset, offset + valLen); offset += valLen;

      pkg.headers[key] = value;
    }

    const payloadLength = data.readUInt32LE(offset); offset += 4;
    pkg.payload = data.subarray(offset, offset + payloadLength);

    return pkg;
  }
}
