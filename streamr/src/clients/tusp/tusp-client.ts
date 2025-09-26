import dgram from 'dgram';
import { TuspPackage, TuspMessageType } from './tusp-package';

export interface IMediaConsumer {
  startConsuming(): void;
  addSegment(segment: Uint8Array): void;
}

export class TuspClient {
  private udpClient = dgram.createSocket('udp4');
  private segmentBuffer: Uint8Array[] = [];
  private expectedSequence = 0;

  constructor() {
    this.udpClient.bind();
  }

  private sendPackage(remoteHost: string, remotePort: number, pkg: TuspPackage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const message = pkg.serialize();
      this.udpClient.send(message, remotePort, remoteHost, (err) => {
        if (err) return reject(err);
        this.udpClient.once('message', (msg) => resolve(msg));
      });
    });
  }

  async ping(remoteHost: string, remotePort: number) {
    const pkg = new TuspPackage();
    pkg.messageType = TuspMessageType.Ping;

    for (let i = 1; i <= 4; i++) {
      try {
        const start = Date.now();
        const response = await this.sendPackage(remoteHost, remotePort, pkg);
        const elapsed = Date.now() - start;
        const reply = TuspPackage.deserialize(response);
        console.log(`[Client] Reply ${i} from ${remoteHost}: time=${elapsed} ms, message='${Buffer.from(reply.payload).toString()}'`);
      } catch (err) {
        console.log(`[Client] Reply ${i} from ${remoteHost}: ${err}`);
      }
    }
  }

  async init(remoteHost: string, remotePort: number) {
    const pkg = new TuspPackage();
    pkg.messageType = TuspMessageType.Init;

    try {
      const response = await this.sendPackage(remoteHost, remotePort, pkg);
      const reply = TuspPackage.deserialize(response);
      console.log(`[Client] Reply from ${remoteHost}: message='${Buffer.from(reply.payload).toString()}'`);
    } catch (err) {
      console.log(`[Client] Reply from ${remoteHost}: ${err}`);
    }
  }

  async startTestVideoStream(remoteHost: string, remotePort: number) {
    const pkg = new TuspPackage();
    pkg.messageType = TuspMessageType.Data;

    try {
      await this.sendPackage(remoteHost, remotePort, pkg);
      this.consumeVideoStream();
    } catch (err) {
      console.log(`[Client] Reply from ${remoteHost}: ${err}`);
    }
  }

  async startVideoStream(remoteHost: string, remotePort: number, consumer: IMediaConsumer) {
    const pkg = new TuspPackage();
    pkg.messageType = TuspMessageType.Data;

    try {
      await this.sendPackage(remoteHost, remotePort, pkg);
      consumer.startConsuming();
      this.consumeVideoStream(consumer);
    } catch (err) {
      console.log(`[Client] Reply from ${remoteHost}: ${err}`);
    }
  }

  private consumeVideoStream(consumer?: IMediaConsumer) {
    this.udpClient.on('message', (msg) => {
      const pkg = TuspPackage.deserialize(msg);
      if (pkg.sequenceNumber !== this.expectedSequence) {
        console.log(`[Client] Lost packet: expected=${this.expectedSequence}, got=${pkg.sequenceNumber}`);
      } else {
        this.expectedSequence++;
      }
      this.handleVideoChunk(pkg, consumer);
    });
  }

  private handleVideoChunk(pkg: TuspPackage, consumer?: IMediaConsumer) {
    this.segmentBuffer.push(pkg.payload);
    console.log(`[Client] Received segment ${pkg.sequenceNumber}: ${pkg.payloadLength} bytes`);

    if (pkg.headers['IsLast'] === 'true') {
      const completeSegment = Buffer.concat(this.segmentBuffer).subarray(0);
      this.segmentBuffer = [];
      if (consumer) consumer.addSegment(completeSegment);
      this.decodeSegment(completeSegment);
    }
  }

  private decodeSegment(segment: Uint8Array) {
    console.log(`[Client] Received complete segment: ${segment.length} bytes`);
  }
}