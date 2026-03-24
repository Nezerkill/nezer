import { useState, useEffect, useRef } from 'react'
import avatarImg from './avatar.jpg'
import { 
  FaGithub, 
  FaTelegram, 
  FaSpotify, 
  FaYoutube, 
  FaTwitch,
  FaDesktop,
  FaMobileAlt,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaVideo,
  FaPlay,
  FaPause,
  FaInfoCircle,
  FaEye,
  FaMousePointer,
  FaLinux,
  FaTerminal
} from 'react-icons/fa'

function App() {
  // ============================================
  // 📝 РЕДАКТИРУЙ ДАННЫЕ ЗДЕСЬ
  // ============================================
  
  const profile = {
    username: "nezerkill",
    bio: "CachyOS User | Hyprland Enthusiast",
    avatar: avatarImg,
    roles: ["Linux User", "Arch Based"],
    views: true
  }

  const socialLinks = {
    github: "https://github.com/Nezerkill",
    telegram: "https://t.me/nezerkill",
    spotify: "https://open.spotify.com/user/nezerkill",
    youtube: "https://www.youtube.com/@Nezerkill",
    twitch: "https://www.twitch.tv/nezer_kill"
  }

  const pcSpecs = {
    os: "CachyOS Linux",
    wm: "Hyprland",
    cpu: "Intel Xeon E5-2640 v3 (16)",
    gpu: "AMD Radeon RX 5700 XT",
    ram: "16 GB DDR4",
    storage: "512 GB NVMe"
  }

  const mainDevice = {
    name: "Poco F6",
    specs: "8/256 GB | Snapdragon 8s Gen 3",
    tag: "Daily Driver"
  }

  const music = {
    src: "", // URL к аудиофайлу (mp3)
    title: "Track Name - Artist",
    showPlayer: false // показать музыкальный плеер
  }

  // ============================================
  // ✅ КОНЕЦ НАСТРОЕК
  // ============================================

  const [revealed, setRevealed] = useState(false)
  const [views, setViews] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const revealIconRef = useRef(null)

  // Счётчик просмотров
  useEffect(() => {
    if (profile.views) {
      fetch("https://api.counterapi.dev/v2/biocouter/biocouter/up")
        .then(res => res.json())
        .then(data => {
          if (data?.data?.up_count !== undefined) {
            setViews(data.data.up_count)
          }
        })
        .catch(() => setViews(0))
    }
  }, [profile.views])

  // Снег эффект
  useEffect(() => {
    if (!revealed) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    
    const flakes = []
    for (let i = 0; i < 100; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 4 + 1,
        d: Math.random() + 1
      })
    }
    
    let angle = 0
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'white'
      ctx.beginPath()
      
      for (let f of flakes) {
        ctx.moveTo(f.x, f.y)
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
      }
      ctx.fill()
      
      angle += 0.005
      for (let f of flakes) {
        f.y += Math.pow(f.d, 2) * 0.5 + 0.5
        f.x += Math.sin(angle) * 1.5
        if (f.y > h) {
          f.y = 0
          f.x = Math.random() * w
        }
      }
      
      requestAnimationFrame(draw)
    }
    
    draw()
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [revealed])

  // Аудио плеер
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', onEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    const progress = e.currentTarget
    const rect = progress.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const newTime = (offsetX / rect.width) * audio.duration
    audio.currentTime = newTime
  }

  const formatTime = (time) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* Canvas для снега */}
      <canvas ref={canvasRef} id="snow-canvas" />
      
      {/* Click to Reveal Overlay */}
      <div 
        className={`reveal-overlay ${revealed ? 'hidden' : ''}`}
        onClick={() => setRevealed(true)}
      >
        <div className="reveal-content">
          <div className="reveal-icon">
            <FaMousePointer />
          </div>
          <div className="reveal-text">Click to Reveal</div>
        </div>
      </div>

      {/* Основная карточка */}
      <div className="card">
        {/* Мета сверху */}
        <div className="meta-top">
          {profile.views && (
            <div className="meta views">
              <FaEye /> <span id="views-count">{views.toLocaleString()}</span>
            </div>
          )}
          <div className="meta info">
            <FaInfoCircle />
          </div>
          <div className="info-tooltip">Bio by @yourusername</div>
        </div>

        {/* Аватарка */}
        <div className="avatar">
          <img src={profile.avatar} alt="Avatar" />
        </div>

        {/* Имя пользователя */}
        <h1>{profile.username}</h1>

        {/* Роли */}
        <div className="roles">
          {profile.roles.map((role, i) => (
            <div key={i} className="role">{role}</div>
          ))}
        </div>

        <div className="divider"></div>

        {/* Био */}
        <p className="bio">{profile.bio}</p>

        <div className="divider"></div>

        {/* Социальные ссылки */}
        <div className="social">
          {socialLinks.github && (
            <a className="s-btn github" href={socialLinks.github} target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
          )}
          {socialLinks.telegram && (
            <a className="s-btn telegram" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">
              <FaTelegram />
            </a>
          )}
          {socialLinks.spotify && (
            <a className="s-btn spotify" href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
              <FaSpotify />
            </a>
          )}
          {socialLinks.youtube && (
            <a className="s-btn youtube" href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          )}
          {socialLinks.twitch && (
            <a className="s-btn twitch" href={socialLinks.twitch} target="_blank" rel="noopener noreferrer">
              <FaTwitch />
            </a>
          )}
        </div>

        {/* PC Specs */}
        <div className="specs-section">
          <div className="specs-title">
            <FaDesktop /> PC Specs
          </div>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label"><FaLinux /> OS</span>
              <span className="spec-value">{pcSpecs.os}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">🪟 WM</span>
              <span className="spec-value">{pcSpecs.wm}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FaMicrochip /> CPU</span>
              <span className="spec-value">{pcSpecs.cpu}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FaVideo /> GPU</span>
              <span className="spec-value">{pcSpecs.gpu}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FaMemory /> RAM</span>
              <span className="spec-value">{pcSpecs.ram}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FaHdd /> Storage</span>
              <span className="spec-value">{pcSpecs.storage}</span>
            </div>
          </div>
        </div>

        {/* Основное устройство */}
        <div className="device-section">
          <div className="device-icon">📱</div>
          <div className="device-info">
            <div className="device-name">{mainDevice.name}</div>
            <div className="device-tag">{mainDevice.specs}</div>
            <div className="device-tag" style={{ marginLeft: '8px' }}>{mainDevice.tag}</div>
          </div>
        </div>

        {/* Музыкальный плеер */}
        {music.showPlayer && music.src && (
          <div className="music-player">
            <FaInfoCircle className="info-icon" />
            <div className="track-tooltip">{music.title}</div>
            <div className="controls">
              <button id="play-btn" onClick={togglePlay} aria-label="Play">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <div className="progress" id="progress" onClick={handleProgressClick}>
                <div className="bar" id="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="time" id="time">{formatTime(currentTime)}</span>
            </div>
            <audio ref={audioRef} src={music.src}></audio>
          </div>
        )}
      </div>
    </>
  )
}

export default App
