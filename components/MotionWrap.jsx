export default function MotionWrap({
  children,
  delay = 0,
}) {
  return (
    <div
      className="motion-wrap"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}