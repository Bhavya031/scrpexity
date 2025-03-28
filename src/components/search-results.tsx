"use client";

import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  ExternalLink,
  Search,
  BookOpen,
  Sparkles,
  Wand2,
} from "lucide-react";

interface SearchResultsProps {
  searchId: string;
  query: string;
}

interface SearchStep {
  type: "enhancing" | "searching" | "reading" | "wrapping" | "cleanup";
  content?: string;
  sources?: Array<{
    name: string;
    url: string;
  }>;
  enhancedQuery?: string;
  link?: string;
  contentBlocks?: number;
  summary?: string;
  error?: string;
  message?: string;
  enhancedQueryLoaded?: boolean; // New prop to track if enhanced query is loaded
}

export function SearchResults({ searchId, query }: SearchResultsProps) {
  const [steps, setSteps] = useState<SearchStep[]>([
    { type: "enhancing", enhancedQueryLoaded: false }, // Initialize with loading step 1
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [enhancedQuery, setEnhancedQuery] = useState<string | null>(null);
  const [step2Started, setStep2Started] = useState(false);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      const fetchSearchData = async () => {
        try {
          const response = await fetch("/api/enhance-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          if (!reader) {
            console.error("Response body reader is null.");
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
              if (part) {
                try {
                  const data = JSON.parse(part);
                  console.log("Received data:", data);

                  switch (data.step) {
                    case 1:
                      setEnhancedQuery(data.enhancedQuery);
                      setSteps([
                        {
                          type: "enhancing",
                          enhancedQuery: data.enhancedQuery,
                          enhancedQueryLoaded: true, // Mark enhanced query as loaded
                        },
                      ]);
                      setCurrentStep(0);
                      break;
                    case 2:
                      setSteps((prev) => [
                        ...prev,
                        { type: "searching", message: data.message },
                      ]);
                      setCurrentStep(1);
                      setStep2Started(true);
                      break;
                    case 3:
                      setSteps((prev) => [
                        ...prev,
                        {
                          type: "reading",
                          link: data.link,
                          contentBlocks: data.contentBlocks,
                          error: data.error,
                        },
                      ]);
                      setCurrentStep(2);
                      break;
                    case 4:
                      setResult(data.summary);
                      setSteps((prev) => [
                        ...prev,
                        { type: "wrapping", summary: data.summary },
                      ]);
                      setCurrentStep(3);
                      break;
                    case 5:
                      setSteps((prev) => [
                        ...prev,
                        { type: "cleanup", message: data.message },
                      ]);
                      setIsLoading(false);
                      break;
                    default:
                      console.warn("Unknown step:", data.step);
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e, part);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching search data:", error);
          setIsLoading(false);
        }
      };
      fetchSearchData();
    }
  }, [searchId, query]);

  const getStepIcon = (type: string, isActive: boolean, index: number) => {
    if (isActive && isLoading && index === currentStep) {
      return <Loader2 className="h-5 w-5 animate-spin text-brand-pink" />;
    }

    switch (type) {
      case "enhancing":
        return <Wand2 className="h-5 w-5 text-brand-pink" />;
      case "searching":
        return <Search className="h-5 w-5 text-brand-pink" />;
      case "reading":
        return <BookOpen className="h-5 w-5 text-brand-orange" />;
      case "wrapping":
        return <Sparkles className="h-5 w-5 text-brand-pink" />;
      default:
        return null;
    }
  };

  const getStepColor = (type: string, index: number) => {
    if (index === currentStep) {
      switch (type) {
        case "enhancing":
          return "border-brand-pink/20 bg-brand-pink/5";
        case "searching":
          return "border-brand-pink/20 bg-brand-pink/5";
        case "reading":
          return "border-brand-orange/20 bg-brand-orange/5";
        case "wrapping":
          return "border-brand-pink/20 bg-brand-pink/5";
        default:
          return "bg-background";
      }
    } else {
      return "bg-background";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{query}</h1>

      <div className="space-y-6 mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${getStepColor(step.type, index)}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-background flex items-center justify-center">
                {getStepIcon(step.type, index === currentStep, index)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {step.type === "enhancing" && "Enhancing your search term"}
                    {step.type === "searching" && "Searching the web"}
                    {step.type === "reading" && "Reading sources"}
                    {step.type === "wrapping" && "Synthesizing information"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Step {index + 1} of {steps.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.type === "enhancing" &&
                    "Optimizing your query for better results"}
                  {step.type === "searching" &&
                    `Finding relevant information about "${
                      enhancedQuery || query
                    }"`}
                  {step.type === "reading" &&
                    "Analyzing content from multiple sources"}
                  {step.type === "wrapping" && "Creating a comprehensive answer"}
                </p>

                {step.type === "enhancing" &&
                  step.enhancedQueryLoaded &&
                  step.enhancedQuery && (
                    <div className="mt-4 p-3 rounded-md bg-background border border-brand-pink/20">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Enhanced search term:
                      </p>
                      <p className="text-sm font-medium">{step.enhancedQuery}</p>
                    </div>
                  )}
                {step.type === "searching" && step2Started && (
                  <p>Step 2 started</p>
                )}
                {step.type === "reading" && step.link && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      Link:
                    </h4>
                    <p>{step.link}</p>
                    {step.contentBlocks && (
                      <p>Content blocks: {step.contentBlocks}</p>
                    )}
                    {step.error && <p>Error: {step.error}</p>}
                  </div>
                )}

                {step.type === "wrapping" && step.summary && (
                  <div className="mt-4">
                    <p>Summary: {step.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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
  );
}

function SourceCard({
  name,
  url,
  color = "pink",
}: {
  name: string;
  url: string;
  color?: "pink" | "orange";
}) {
  const getColorClass = () => {
    switch (color) {
      case "pink":
        return "bg-brand-pink/10 text-brand-pink";
      case "orange":
        return "bg-brand-orange/10 text-brand-orange";
      default:
        return "bg-primary/10 text-primary";
    }
  };

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
  );
}