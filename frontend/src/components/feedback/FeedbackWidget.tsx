'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Star } from 'lucide-react'
import { toast } from 'sonner'

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'question'
  priority: 'low' | 'medium' | 'high' | 'critical'
  rating: number
  description: string
  page: string
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'improvement',
    priority: 'medium',
    rating: 5,
    description: '',
    page: typeof window !== 'undefined' ? window.location.pathname : '/'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.description.trim()) {
      toast.error('Por favor, descreva seu feedback')
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Feedback enviado com sucesso! Obrigado pela contribuição.')
      setIsOpen(false)
      setFeedback({
        type: 'improvement',
        priority: 'medium', 
        rating: 5,
        description: '',
        page: typeof window !== 'undefined' ? window.location.pathname : '/'
      })
    } catch (error) {
      toast.error('Erro ao enviar feedback. Tente novamente.')
    }
  }

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= feedback.rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-400 hover:text-yellow-400'
          }`}
          onClick={() => setFeedback({ ...feedback, rating: star })}
        />
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-neutral-900 border-neutral-700 hover:bg-neutral-800"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Enviar Feedback
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Feedback</Label>
            <Select
              value={feedback.type}
              onValueChange={(value: any) => setFeedback({ ...feedback, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                <SelectItem value="feature">✨ Feature Request</SelectItem>
                <SelectItem value="improvement">🔧 Melhoria</SelectItem>
                <SelectItem value="question">❓ Dúvida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selection */}
          {feedback.type === 'bug' && (
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={feedback.priority}
                onValueChange={(value: any) => setFeedback({ ...feedback, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="critical">🔴 Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label>Avaliação Geral</Label>
            <StarRating />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição
              {feedback.type === 'bug' && ' (inclua passos para reproduzir)'}
            </Label>
            <Textarea
              id="description"
              placeholder={
                feedback.type === 'bug'
                  ? 'Descreva o problema encontrado e como reproduzi-lo...'
                  : 'Descreva sua sugestão ou feedback...'
              }
              value={feedback.description}
              onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
              className="bg-neutral-800 border-neutral-600 text-white min-h-[100px]"
            />
          </div>

          {/* Page Info */}
          <div className="text-xs text-gray-400">
            Página atual: {feedback.page}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Enviar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}