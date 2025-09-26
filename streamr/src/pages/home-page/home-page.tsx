import React, { useEffect } from "react";
import MediaPlayer from '../../components/media-player/media-player';
import './home-page.css';
import StreamList from "../../components/stream-list/stream-list";

function HomePage() {
    useEffect(() => {
        window.tusp.ping('127.0.0.1', 5000).then((response) => {
            console.log('[Client] Ping reply:', response);
        }).catch((err) => {
            console.error('[Client] Ping error:', err);
        });
    }, []);

    return (
        <div className="page">
            <main className="home-main">
                <section>
                    <MediaPlayer />
                    <StreamList />
                </section>
            </main>
        </div>
    );
}

export default HomePage;