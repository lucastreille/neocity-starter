import React, { useState, useEffect, useRef } from 'react';
import eventBus from 'shared/eventBus';
import './CitizenFeed.css';

const PANIC_POSTS = {
  calm: [
    { text: 'La vue depuis Zone A ce soir... 🌃', delay: 4000 },
    { text: 'Café au Blue Moon, comme d\'hab ☕', delay: 4000 },
    { text: 'Les néons qui font beau ce soir 💜', delay: 5000 },
  ],
  storm: [
    { text: 'Il pleut un truc violet... ça brûle ?? 🌧️', delay: 2000 },
    { text: 'C\'est pas normal ce ciel... 😐', delay: 2000 },
    { text: 'Toxicité en hausse! ⚠️', delay: 2000 },
  ],
  blackout: [
    { text: 'COUPURE CHEZ MOI !! 😱', delay: 1000 },
    { text: 'Les ascenseurs bloqués!! 🆘', delay: 1000 },
    { text: 'TOUT EST NOIR 🔌', delay: 1000 },
    { text: 'Qui a du courant??', delay: 1000 },
  ],
  riot: [
    { text: 'ANONYMOUS EST LÀ 🔥🔥🔥', delay: 1000 },
    { text: 'CHAOS EN LIGNE!! 💀', delay: 1000 },
    { text: 'Tout s\'effondre!! 😱😱😱', delay: 1000 },
  ],
  love: [
    { text: 'C\'est magnifique 😭', delay: 3000 },
    { text: 'Je comprends pas mais je pleure ?? 🥺', delay: 3000 },
    { text: 'Ressenti de l\'amour... 💜💜💜', delay: 3000 },
  ],
};

const AVATARS = ['👥', '🤖', '👨', '👩', '👾', '🎭', '🕵️', '💀'];

function generatePost(category = 'calm') {
  const posts = PANIC_POSTS[category] || PANIC_POSTS.calm;
  const post = posts[Math.floor(Math.random() * posts.length)];
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const user = `@citizen_${Math.floor(Math.random() * 9999)}`;

  return {
    id: Date.now() + Math.random(),
    avatar,
    user,
    text: post.text,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    delay: post.delay,
  };
}

export default function CitizenFeed() {
  const [panicLevel, setPanicLevel] = useState(5);
  const [posts, setPosts] = useState([generatePost('calm')]);
  const [isCrisis, setIsCrisis] = useState(false);
  const [trending, setTrending] = useState('#CalmNight');
  const [onlineCount, setOnlineCount] = useState(1247);
  const postIntervalRef = useRef(null);
  const unsubscribesRef = useRef([]);

  // Calculate crisis state based on panic level
  const updateCrisisState = (level) => {
    setIsCrisis(level > 40);
    setPanicLevel(level);

    // Emit crowd:panic event
    const hashtags = ['#Panic', '#CrashNet', '#Blackout', '#Riot', '#SOS'];
    const trending = hashtags[Math.floor(Math.random() * hashtags.length)];
    setTrending(trending);
    eventBus.emit('crowd:panic', {
      level: Math.min(level, 100),
      trending: trending,
    });

    console.log(`🚨 PANIC LEVEL: ${level} | TRENDING: ${trending}`);
  };

  // Generate new posts at intervals
  useEffect(() => {
    const generatePostsInterval = () => {
      let category = 'calm';
      let interval = 4000;

      if (panicLevel > 80) {
        category = 'blackout';
        interval = 1000;
      } else if (panicLevel > 60) {
        category = 'riot';
        interval = 1000;
      } else if (panicLevel > 40) {
        category = 'storm';
        interval = 2000;
      }

      postIntervalRef.current = setInterval(() => {
        const newPost = generatePost(category);
        setPosts(prevPosts => {
          const updated = [newPost, ...prevPosts];
          return updated.slice(0, 20); // Keep max 20 posts
        });
      }, interval);
    };

    generatePostsInterval();

    return () => {
      if (postIntervalRef.current) {
        clearInterval(postIntervalRef.current);
      }
    };
  }, [panicLevel]);

  // Listen to events
  useEffect(() => {
    const unsubPowerOutage = eventBus.on('power:outage', ({ severity, cityPower }) => {
      console.log('⚡ Power Outage:', { severity, cityPower });
      setPosts([generatePost('blackout')]);
      updateCrisisState(87);
    });

    const unsubWeatherChange = eventBus.on('weather:change', ({ condition, toxicity }) => {
      console.log('🌦️ Weather Change:', { condition, toxicity });
      const level = Math.min(45 + (toxicity || 20), 80);
      updateCrisisState(level);
    });

    const unsubHackerCommand = eventBus.on('hacker:command', ({ command }) => {
      console.log('🔓 Hacker Command:', command);

      if (command === 'riot') {
        setPosts([generatePost('riot')]);
        updateCrisisState(95);
      } else if (command === 'love') {
        setPosts([generatePost('love')]);
        updateCrisisState(10);
      } else if (command === 'reset') {
        setPosts([generatePost('calm')]);
        updateCrisisState(5);
      }
    });

    unsubscribesRef.current = [unsubPowerOutage, unsubWeatherChange, unsubHackerCommand];

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
    };
  }, []);

  // Simulate button handlers
  const handleSimulate = (type) => {
    console.log(`🎬 Simulating: ${type}`);

    switch (type) {
      case 'storm':
        eventBus.emit('weather:change', { condition: 'toxic_rain', toxicity: 75 });
        break;
      case 'blackout':
        eventBus.emit('power:outage', { severity: 'critical', cityPower: 0 });
        break;
      case 'riot':
        eventBus.emit('hacker:command', { command: 'riot' });
        break;
      case 'love':
        eventBus.emit('hacker:command', { command: 'love' });
        break;
      case 'reset':
        eventBus.emit('hacker:command', { command: 'reset' });
        break;
      default:
        break;
    }
  };

  const panicColor = panicLevel > 60 ? '#ff003c' : panicLevel > 40 ? '#ff6b35' : '#00ff88';
  const badgeEmoji = isCrisis ? '🔴' : '🟢';

  return (
    <div className={`citizen-feed ${isCrisis ? 'crisis-mode' : ''}`}>
      <div className="feed-header">
        <span>{badgeEmoji} NEOCITY SOCIAL - {onlineCount} en ligne</span>
        <span style={{ fontSize: '0.7rem', color: panicColor }}>
          PANIC: {panicLevel}% | {trending}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', order: '-1' }}>
        <button className="simulate-btn" onClick={() => handleSimulate('storm')}>
          WEATHER
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('blackout')}>
          BLACKOUT
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('riot')}>
          RIOT
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('love')}>
          LOVE
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('reset')}>
          RESET
        </button>
      </div>

      <div className="panic-bar">
        <div className="panic-fill" style={{ width: `${panicLevel}%`, backgroundColor: panicColor }} />
      </div>

      <div className="feed-posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <div className="post-avatar">{post.avatar}</div>
            <div className="post-content">
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="post-user">{post.user}</span>
                <span className="post-ts">{post.timestamp}</span>
              </div>
              <div className="post-text">{post.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.65rem', color: '#4a5568' }}>
        📡 listen: power:outage, weather:change, hacker:command | emit: crowd:panic
      </div>
    </div>
  );
}
