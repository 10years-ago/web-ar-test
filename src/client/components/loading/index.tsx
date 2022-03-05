const Loading = ({
  isfull,
    loadingStyle,
    roundSize,
    text,
    textStyle
}: {
  // 是否全屏
  isfull?: boolean
  // 最外層的自定義樣式
  loadingStyle?: string
  // loading圓圈的大小，默認為6
  roundSize?: number
  // 顯示的文字，如果沒有則默認為Loading ...
  text?: string
  // 文字的樣式，傳入tailwind的樣式
  textStyle?: string
}) => {
  return (
    <div className={`flex items-center justify-center ${isfull ? 'w-screen h-screen' :'w-full h-full'} ${loadingStyle}`}>
      <div className="flex justify-center items-center space-x-1 text-sm text-gray-700 w-full">
        <svg fill='none' className={`${roundSize ? `w-${roundSize} h-${roundSize}` : 'w-20 h-20'} animate-spin`} viewBox="0 0 32 32">
          <path clipRule='evenodd'
            d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
            fill='currentColor' fillRule='evenodd' />
        </svg>
        <div className={textStyle}>{text || 'Loading ...'}</div>
      </div>
    </div>
  )
};

export default Loading;
