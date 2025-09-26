import StreamCard from '../stream-card/stream-card';
import './stream-list.css';

const streams = [
  {
    id: 2,
    title: 'Chill Stream',
    viewerCount: 3500,
    streamSrc: '/videos/sample.mp4',
  },
];

export default function StreamList() {
  return (
    <section className="stream-list">
      <h2>Live Streams</h2>
      <div className="streams-container">
        {streams.map((stream) => (
          <StreamCard
            key={stream.id}
            title={stream.title}
            viewerCount={stream.viewerCount}
            streamSrc={stream.streamSrc}
          />
        ))}
      </div>
    </section>
  );
}
