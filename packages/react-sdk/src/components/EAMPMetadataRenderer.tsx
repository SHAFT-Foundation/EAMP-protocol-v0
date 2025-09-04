import React from 'react';
import { EAMPMetadata } from '@eamp/javascript-sdk';

export interface EAMPMetadataRendererProps {
  metadata: EAMPMetadata;
  renderMode?: 'summary' | 'detailed' | 'custom';
  onRenderCustom?: (metadata: EAMPMetadata) => React.ReactNode;
  className?: string;
}

export function EAMPMetadataRenderer({
  metadata,
  renderMode = 'summary',
  onRenderCustom,
  className = ''
}: EAMPMetadataRendererProps) {
  if (renderMode === 'custom' && onRenderCustom) {
    return <div className={className}>{onRenderCustom(metadata)}</div>;
  }

  if (renderMode === 'summary') {
    return (
      <div className={`eamp-metadata-summary ${className}`}>
        <div className="eamp-header">
          <h3 className="eamp-id">{metadata.id}</h3>
          <span className="eamp-type">{metadata.type}</span>
        </div>
        <p className="eamp-short-alt">{metadata.shortAlt}</p>
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="eamp-tags">
            {metadata.tags.map((tag, index) => (
              <span key={index} className="eamp-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`eamp-metadata-detailed ${className}`}>
      <div className="eamp-header">
        <h3 className="eamp-id">{metadata.id}</h3>
        <span className="eamp-type">{metadata.type}</span>
        <span className="eamp-version">v{metadata.eampVersion}</span>
      </div>
      
      <div className="eamp-description">
        <p className="eamp-short-alt">{metadata.shortAlt}</p>
        {metadata.extendedDescription && (
          <p className="eamp-extended-description">{metadata.extendedDescription}</p>
        )}
      </div>

      {metadata.dataPoints && metadata.dataPoints.length > 0 && (
        <div className="eamp-data-points">
          <h4>Data Points</h4>
          <ul>
            {metadata.dataPoints.map((point, index) => (
              <li key={index}>
                <strong>{point.label}:</strong> {point.value} {point.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {metadata.visualElements && metadata.visualElements.length > 0 && (
        <div className="eamp-visual-elements">
          <h4>Visual Elements</h4>
          <ul>
            {metadata.visualElements.map((element, index) => (
              <li key={index}>
                <strong>{element.type}</strong>
                {element.position && ` (${element.position})`}: {element.description}
                {element.color && <span className="color-indicator" style={{backgroundColor: element.color}} />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {metadata.accessibilityFeatures && metadata.accessibilityFeatures.length > 0 && (
        <div className="eamp-accessibility-features">
          <h4>Accessibility Features</h4>
          <div className="eamp-features">
            {metadata.accessibilityFeatures.map((feature, index) => (
              <span key={index} className="eamp-feature-badge">{feature}</span>
            ))}
          </div>
        </div>
      )}

      {metadata.context && (
        <div className="eamp-context">
          <h4>Context</h4>
          {metadata.context.pageTitle && (
            <p><strong>Page:</strong> {metadata.context.pageTitle}</p>
          )}
          {metadata.context.sectionHeading && (
            <p><strong>Section:</strong> {metadata.context.sectionHeading}</p>
          )}
          {metadata.context.purpose && (
            <p><strong>Purpose:</strong> {metadata.context.purpose}</p>
          )}
          {metadata.context.userTask && (
            <p><strong>User Task:</strong> {metadata.context.userTask}</p>
          )}
        </div>
      )}

      {metadata.transcript && (
        <div className="eamp-transcript">
          <h4>Transcript</h4>
          <pre className="eamp-transcript-content">{metadata.transcript}</pre>
        </div>
      )}

      {metadata.scenes && metadata.scenes.length > 0 && (
        <div className="eamp-scenes">
          <h4>Scenes</h4>
          {metadata.scenes.map((scene, index) => (
            <div key={index} className="eamp-scene">
              <strong>{scene.time}</strong>
              <p>{scene.description}</p>
              {scene.speakers && scene.speakers.length > 0 && (
                <p><strong>Speakers:</strong> {scene.speakers.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {metadata.tags && metadata.tags.length > 0 && (
        <div className="eamp-tags">
          <h4>Tags</h4>
          <div className="eamp-tag-list">
            {metadata.tags.map((tag, index) => (
              <span key={index} className="eamp-tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}