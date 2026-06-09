import { useEffect, useState } from 'react'
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai'
import { GiphyFetch } from '@giphy/js-fetch-api'

const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY || 'dc6zaTOxFJmzC'
const gf = new GiphyFetch(giphyApiKey)

const STICKER_PACKS = [
  {
    name: 'Mèo con',
    icon: '🐱',
    stickers: [
      { id: 'cat_smiley', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63a.png', label: 'Cười' },
      { id: 'cat_joy', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f639.png', label: 'Cười ra nước mắt' },
      { id: 'cat_heart_eyes', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63b.png', label: 'Yêu' },
      { id: 'cat_wry', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63c.png', label: 'Cười khẩy' },
      { id: 'cat_kiss', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63d.png', label: 'Hôn' },
      { id: 'cat_shocked', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f640.png', label: 'Kinh hoàng' },
      { id: 'cat_cry', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63f.png', label: 'Khóc' },
      { id: 'cat_pouting', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f63e.png', label: 'Giận' },
      { id: 'cat_grinning', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f638.png', label: 'Hớn hở' },
      { id: 'cat_face', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f431.png', label: 'Mặt mèo' },
      { id: 'cat_full', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f408.png', label: 'Chú mèo' },
    ]
  },
  {
    name: 'Khỉ tinh nghịch',
    icon: '🐵',
    stickers: [
      { id: 'monkey_see', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f648.png', label: 'Che mắt' },
      { id: 'monkey_hear', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f649.png', label: 'Che tai' },
      { id: 'monkey_speak', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f64a.png', label: 'Che miệng' },
      { id: 'monkey_face', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f435.png', label: 'Mặt khỉ' },
      { id: 'monkey_full', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f412.png', label: 'Khỉ con' },
    ]
  },
  {
    name: 'Cổ điển',
    icon: '😀',
    stickers: [
      { id: 'grin', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f600.png', label: 'Cười toe toét' },
      { id: 'grin_eyes', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f601.png', label: 'Cười híp mắt' },
      { id: 'tears_joy', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f602.png', label: 'Cười ra nước mắt' },
      { id: 'sweat_smile', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f605.png', label: 'Cười ra mồ hôi' },
      { id: 'wink', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f609.png', label: 'Nháy mắt' },
      { id: 'heart_eyes', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f60d.png', label: 'Mắt trái tim' },
      { id: 'kiss_blow', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f618.png', label: 'Gửi nụ hôn' },
      { id: 'tongue_wink', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f61c.png', label: 'Lêu lêu' },
      { id: 'sunglasses', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f60e.png', label: 'Ngầu' },
      { id: 'relieved', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f60c.png', label: 'Thở phào' },
      { id: 'thinking', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f914.png', label: 'Suy nghĩ' },
      { id: 'screaming', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f631.png', label: 'Hét lên' },
    ]
  },
  {
    name: 'Muông thú',
    icon: '🐼',
    stickers: [
      { id: 'dog', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f436.png', label: 'Cún con' },
      { id: 'panda', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f43c.png', label: 'Gấu trúc' },
      { id: 'rabbit', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f430.png', label: 'Thỏ con' },
      { id: 'koala', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f428.png', label: 'Koala' },
      { id: 'frog', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f438.png', label: 'Ếch xanh' },
      { id: 'tiger', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f42f.png', label: 'Hổ con' },
      { id: 'bear', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f43b.png', label: 'Gấu nâu' },
      { id: 'penguin', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f427.png', label: 'Chim cánh cụt' },
      { id: 'bee', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f41d.png', label: 'Ong mật' },
      { id: 'unicorn', url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f984.png', label: 'Kỳ lân' },
    ]
  }
]

const ALL_PACKS = [
  { id: 'cat', name: 'Mèo con', icon: '🐱', type: 'local', packIndex: 0 },
  { id: 'monkey', name: 'Khỉ tinh nghịch', icon: '🐵', type: 'local', packIndex: 1 },
  { id: 'classic', name: 'Cổ điển', icon: '😀', type: 'local', packIndex: 2 },
  { id: 'animal', name: 'Muông thú', icon: '🐼', type: 'local', packIndex: 3 },
  { id: 'qoobee', name: 'Qoobee', icon: '💛', type: 'giphy', query: 'qoobee', giphyType: 'stickers' },
  { id: 'pusheen', name: 'Pusheen', icon: '🐈', type: 'giphy', query: 'pusheen', giphyType: 'stickers' },
  { id: 'search', name: 'Tìm GIPHY', icon: '🎬', type: 'giphy_search' }
]

const StickerPicker = ({ onSelectSticker, onClose, className = '' }) => {
  const [activeStickerPack, setActiveStickerPack] = useState(0)
  const [giphyItems, setGiphyItems] = useState([])
  const [giphyLoading, setGiphyLoading] = useState(false)
  const [giphySearch, setGiphySearch] = useState('')
  const [giphySearchType, setGiphySearchType] = useState('stickers') // 'stickers' or 'gifs'

  useEffect(() => {
    const pack = ALL_PACKS[activeStickerPack]
    if (!pack || pack.type === 'local') {
      setGiphyItems([])
      return
    }

    let active = true
    const fetchGiphy = async () => {
      setGiphyLoading(true)
      try {
        let results = []
        if (pack.type === 'giphy') {
          const res = await gf.search(pack.query, { type: pack.giphyType, limit: 24 })
          results = res.data || []
        } else if (pack.type === 'giphy_search') {
          const query = giphySearch.trim()
          if (query) {
            const res = await gf.search(query, { type: giphySearchType, limit: 24 })
            results = res.data || []
          } else {
            const res = await gf.trending({ type: giphySearchType, limit: 24 })
            results = res.data || []
          }
        }
        if (active) {
          setGiphyItems(results)
        }
      } catch (err) {
        console.error('Error fetching Giphy:', err)
      } finally {
        if (active) setGiphyLoading(false)
      }
    }

    if (pack.type === 'giphy_search' && giphySearch.trim() !== '') {
      const delayDebounce = setTimeout(() => {
        fetchGiphy()
      }, 350)
      return () => {
        active = false
        clearTimeout(delayDebounce)
      }
    } else {
      fetchGiphy()
    }

    return () => {
      active = false
    }
  }, [activeStickerPack, giphySearch, giphySearchType])

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex flex-col w-72 h-80 z-[80] ${className}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-2 shrink-0">
        <span className="text-xs font-bold text-gray-500">
          Thư viện nhãn dán ({ALL_PACKS[activeStickerPack]?.name})
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <AiOutlineClose size={12} />
        </button>
      </div>

      {/* Category Selector Tabs */}
      <div className="flex items-center gap-1 pb-2 border-b border-gray-50 mb-2 overflow-x-auto shrink-0 select-none no-scrollbar">
        {ALL_PACKS.map((pack, index) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => {
              setActiveStickerPack(index)
              if (pack.type !== 'giphy_search') {
                setGiphySearch('')
              }
            }}
            className={`px-2 py-1 text-xs rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 ${
              activeStickerPack === index ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-500 hover:bg-gray-50'
            }`}
            title={pack.name}
          >
            <span>{pack.icon}</span>
            <span className="text-[10px]">{pack.name}</span>
          </button>
        ))}
      </div>

      {/* Sub-content wrapper (for search input and filters) */}
      {ALL_PACKS[activeStickerPack]?.type === 'giphy_search' && (
        <div className="flex flex-col gap-1.5 shrink-0 mb-2">
          <div className="relative flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-gray-50/50">
            <AiOutlineSearch className="text-gray-400 mr-1.5 shrink-0" size={14} />
            <input
              type="text"
              value={giphySearch}
              onChange={(e) => setGiphySearch(e.target.value)}
              placeholder="Tìm GIPHY..."
              className="w-full text-xs bg-transparent focus:outline-none placeholder-gray-400 text-gray-800"
            />
            {giphySearch && (
              <button
                type="button"
                onClick={() => setGiphySearch('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <AiOutlineClose size={10} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setGiphySearchType('stickers')}
              className={`px-2.5 py-0.5 text-[9px] rounded-full border transition cursor-pointer font-medium ${
                giphySearchType === 'stickers'
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              Nhãn dán động
            </button>
            <button
              type="button"
              onClick={() => setGiphySearchType('gifs')}
              className={`px-2.5 py-0.5 text-[9px] rounded-full border transition cursor-pointer font-medium ${
                giphySearchType === 'gifs'
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              Ảnh GIF
            </button>
          </div>
        </div>
      )}

      {/* Grid of stickers / GIFs */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {ALL_PACKS[activeStickerPack]?.type === 'local' ? (
          <div className="grid grid-cols-4 gap-2 pr-1">
            {STICKER_PACKS[ALL_PACKS[activeStickerPack].packIndex].stickers.map((stk) => (
              <button
                key={stk.id}
                type="button"
                onClick={() => onSelectSticker(stk.url)}
                className="p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                title={stk.label}
              >
                <img src={stk.url} alt={stk.label} className="w-10 h-10 object-contain mx-auto" />
              </button>
            ))}
          </div>
        ) : (
          <>
            {giphyLoading ? (
              <div className="grid grid-cols-3 gap-2 pr-1">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-gray-100 rounded-lg aspect-square w-full" />
                ))}
              </div>
            ) : giphyItems.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-gray-400 py-8">
                Không tìm thấy kết quả.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pr-1">
                {giphyItems.map((item) => {
                  const thumbUrl = item.images.fixed_width_small?.url || item.images.fixed_height_small?.url
                  const sendUrl = item.images.fixed_width?.url || item.images.original?.url
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectSticker(sendUrl)}
                      className="p-1 rounded-lg hover:bg-gray-50 transition cursor-pointer flex items-center justify-center overflow-hidden border border-gray-100/40 bg-gray-50/20 aspect-square"
                      title={item.title}
                    >
                      <img src={thumbUrl} alt={item.title} className="max-w-full max-h-full object-contain mx-auto" />
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StickerPicker
