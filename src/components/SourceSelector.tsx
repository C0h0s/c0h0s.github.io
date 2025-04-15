import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Server } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Source } from '@/services/streamingApi';

interface SourceSelectorProps {
  sources: Source[];
  currentSource: Source;
  onSelectSource: (source: Source) => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({ 
  sources, 
  currentSource, 
  onSelectSource 
}) => {
  // Group sources by provider
  const streamVidSources = sources.filter(source => source.provider === 'StreamVid');
  const otherSources = sources.filter(source => source.provider !== 'StreamVid');
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-black/50 text-white border-white/20 hover:bg-white/20">
          <Server className="mr-2 h-4 w-4" />
          {currentSource.provider === 'StreamVid' ? (
            <>StreamVid ({currentSource.quality})</>
          ) : (
            <>{currentSource.name} ({currentSource.quality})</>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border-white/20 text-white">
        <DropdownMenuLabel>Select Source</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        
        {/* StreamVid sources first (if any) */}
        {streamVidSources.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gaming-purple">Premium Streams</DropdownMenuLabel>
            {streamVidSources.map((source) => (
              <DropdownMenuItem
                key={source.id}
                className={`flex justify-between items-center cursor-pointer ${
                  currentSource.id === source.id ? 'bg-white/20' : ''
                } hover:bg-white/10`}
                onClick={() => onSelectSource(source)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">StreamVid</span>
                  <span className="text-xs text-gray-400">{source.quality} • Premium</span>
                </div>
                {currentSource.id === source.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuLabel className="text-xs">Alternative Sources</DropdownMenuLabel>
          </>
        )}
        
        {/* Other sources */}
        {otherSources.map((source) => (
          <DropdownMenuItem
            key={source.id}
            className={`flex justify-between items-center cursor-pointer ${
              currentSource.id === source.id ? 'bg-white/20' : ''
            } hover:bg-white/10`}
            onClick={() => onSelectSource(source)}
          >
            <div className="flex flex-col">
              <span>{source.name}</span>
              <span className="text-xs text-gray-400">{source.provider} ({source.quality})</span>
            </div>
            {currentSource.id === source.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SourceSelector;
