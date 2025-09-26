import './stream-card.css';

type StreamCardProps = {
  title: string;
  viewerCount: number;
  streamSrc: string;
};

export default function StreamCard({ title, viewerCount, streamSrc }: StreamCardProps) {
  return (
    <div className="stream-card">
      <video
        src={streamSrc}
        autoPlay
        muted
        loop
        playsInline
        className="stream-video"
      />
      <div className="stream-gradient" />
      <div className="stream-info">
        <h3>{title}</h3>
        <p>{viewerCount.toLocaleString()} viewers</p>
      </div>
    </div>
  );
}