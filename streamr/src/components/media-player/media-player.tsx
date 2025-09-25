import React from 'react';

function MediaPlayer() {
  return (
    <div>
      <video src="/videos/sample.mp4" controls width="640" height="360">
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default MediaPlayer;
