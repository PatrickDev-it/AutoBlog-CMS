import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

interface CopyPopupProps {
  isVisible: boolean
}

export function CopyPopup({ isVisible }: CopyPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <Check className="h-5 w-5" />
          <span>Copied to clipboard!</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

