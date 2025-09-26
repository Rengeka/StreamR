function MediaPlayer() {
  return (
    <div className="video-player">
      <video src="/videos/sample.mp4" controls width="640" height="360">
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default MediaPlayer;