"use client"

import { useEffect, useState } from "react"
import { Loader2, ExternalLink, Search, BookOpen, Sparkles } from "lucide-react"

interface SearchResultsProps {
  searchId: string
  query: string
}

interface SearchStep {
  type: "searching" | "reading" | "wrapping"
  content?: string
  sources?: Array<{
    name: string
    url: string
  }>
}

export function SearchResults({ searchId, query }: SearchResultsProps) {
  const [steps, setSteps] = useState<SearchStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Simulate the search process
    const simulateSearch = async () => {
      // Step 1: Searching
      setSteps([{ type: "searching" }])
      setCurrentStep(0)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 2: Reading sources
      setSteps((prev) => [
        ...prev,
        {
          type: "reading",
          sources: [
            { name: "example.com", url: "https://example.com" },
            { name: "docs.example.org", url: "https://docs.example.org" },
            { name: "wikipedia.org", url: "https://wikipedia.org" },
          ],
        },
      ])
      setCurrentStep(1)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 3: Wrapping up
      setSteps((prev) => [...prev, { type: "wrapping" }])
      setCurrentStep(2)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Final result
      setResult(`Transformers are a groundbreaking deep learning architecture introduced in 2017 through the paper "Attention Is All You Need" by researchers at Google Brain. They have become a cornerstone in machine learning, particularly for tasks involving sequential data, such as natural language processing (NLP), computer vision, and multimodal applications.

Key features of Transformers include:

1. Self-Attention Mechanism: Transformers rely on self-attention to process input data. This mechanism allows the model to focus on the most relevant parts of the input sequence, capturing relationships between elements regardless of their position in the sequence.

2. Parallel Processing: Unlike RNNs, transformers process entire sequences simultaneously, significantly reducing training time and enabling efficient handling of longer sequences.

3. Encoder-Decoder Architecture: The original transformer design consists of an encoder to process input data and a decoder to generate output.

Transformers have revolutionized AI by enabling more efficient training on larger datasets and achieving state-of-the-art results across multiple domains.`)
      setIsLoading(false)
    }

    simulateSearch()

    return () => {
      // Cleanup logic here
    }
  }, [searchId, query])

  const getStepIcon = (type: string, isActive: boolean) => {
    if (isActive && isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-brand-pink" />
    }

    switch (type) {
      case "searching":
        return <Search className="h-5 w-5 text-brand-pink" />
      case "reading":
        return <BookOpen className="h-5 w-5 text-brand-orange" />
      case "wrapping":
        return <Sparkles className="h-5 w-5 text-brand-pink" />
      default:
        return null
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case "searching":
        return "border-brand-pink/20 bg-brand-pink/5"
      case "reading":
        return "border-brand-orange/20 bg-brand-orange/5"
      case "wrapping":
        return "border-brand-pink/20 bg-brand-pink/5"
      default:
        return "bg-background"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{query}</h1>

      {/* Search steps */}
      <div className="space-y-6 mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${index === currentStep ? getStepColor(step.type) + " shadow-md" : "bg-background"}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-background flex items-center justify-center">
                {getStepIcon(step.type, index === currentStep)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {step.type === "searching" && "Searching the web"}
                    {step.type === "reading" && "Reading sources"}
                    {step.type === "wrapping" && "Synthesizing information"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Step {index + 1} of {steps.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.type === "searching" && `Finding relevant information about "${query}"`}
                  {step.type === "reading" && "Analyzing content from multiple sources"}
                  {step.type === "wrapping" && "Creating a comprehensive answer"}
                </p>

                {step.type === "reading" && step.sources && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Sources being analyzed:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.sources.map((source, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-md bg-background">
                          <div className="h-6 w-6 rounded-full bg-brand-orange/10 flex items-center justify-center">
                            <ExternalLink className="h-3 w-3 text-brand-orange" />
                          </div>
                          <span className="flex-1 truncate">{source.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search result */}
      {!isLoading && result && (
        <div className="rounded-lg border bg-card p-6 shadow-md">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">Answer</h2>
            <div className="whitespace-pre-line">{result}</div>

            <div className="mt-8 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Sources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SourceCard
                  name="Wikipedia"
                  url="https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)"
                  color="pink"
                />
                <SourceCard
                  name="Drishti IAS"
                  url="https://www.drishtiias.com/transformers-in-machine-learning"
                  color="orange"
                />
                <SourceCard
                  name="Polo Club"
                  url="https://poloclub.github.io/llm-transformer-visualization/"
                  color="pink"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SourceCard({
  name,
  url,
  color = "pink",
}: {
  name: string
  url: string
  color?: "pink" | "orange"
}) {
  const getColorClass = () => {
    switch (color) {
      case "pink":
        return "bg-brand-pink/10 text-brand-pink"
      case "orange":
        return "bg-brand-orange/10 text-brand-orange"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-md bg-background hover:bg-secondary transition-colors"
    >
      <div className={`h-8 w-8 rounded-full ${getColorClass()} flex items-center justify-center`}>
        <ExternalLink className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>
    </a>
  )
}

