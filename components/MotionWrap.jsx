import dynamic from "next/dynamic";
const MotionDiv = dynamic(
  () => import("framer-motion").then(m => m.motion.div),
  { ssr: false }
);


export default function MotionWrap({ children, delay = 0 }) {
  
  return (
    <MotionDiv

      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </MotionDiv>

  );
}
