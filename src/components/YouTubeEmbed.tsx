export default function YouTubeEmbed(url: string, text: string) {
  const videoId: string = url.split('/').pop()!.split('v=').pop()!.split('&').shift()!
  return (
    <iframe
      width="560"
      height="315"
      src={`https://www.youtube.com/embed/${videoId}`}
      title={text || 'YouTube video'}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  )
}