import React, { useState, useCallback } from 'react';
import { EAMPMetadata } from '@eamp/javascript-sdk';
import { useEAMPMutation } from '../hooks/useEAMPMutation';

export interface EAMPMetadataFormProps {
  initialMetadata?: Partial<EAMPMetadata>;
  onSubmit?: (metadata: EAMPMetadata) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  className?: string;
  mode?: 'create' | 'edit';
}

export function EAMPMetadataForm({
  initialMetadata = {},
  onSubmit,
  onCancel,
  submitButtonText,
  className = '',
  mode = 'create'
}: EAMPMetadataFormProps) {
  const { createMetadata, updateMetadata, isLoading } = useEAMPMutation({
    onSuccess: (metadata) => {
      if (onSubmit) onSubmit(metadata);
    }
  });

  const [formData, setFormData] = useState<Partial<EAMPMetadata>>({
    id: '',
    type: 'image',
    eampVersion: '1.0.0',
    shortAlt: '',
    extendedDescription: '',
    tags: [],
    ...initialMetadata
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = useCallback((field: keyof EAMPMetadata, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const newTags = [...(formData.tags || []), tagInput.trim()];
      handleInputChange('tags', newTags);
      setTagInput('');
    }
  }, [tagInput, formData.tags, handleInputChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', newTags);
  }, [formData.tags, handleInputChange]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.shortAlt) {
      alert('ID and Short Alt are required');
      return;
    }

    const metadata = formData as EAMPMetadata;
    
    if (mode === 'create') {
      await createMetadata(metadata);
    } else {
      await updateMetadata(metadata.id, metadata);
    }
  }, [formData, mode, createMetadata, updateMetadata]);

  const buttonText = submitButtonText || (mode === 'create' ? 'Create Metadata' : 'Update Metadata');

  return (
    <form onSubmit={handleSubmit} className={`eamp-metadata-form ${className}`}>
      <div className="eamp-form-section">
        <h3>Basic Information</h3>
        
        <div className="eamp-form-field">
          <label htmlFor="eamp-id">Resource ID *</label>
          <input
            id="eamp-id"
            type="text"
            value={formData.id || ''}
            onChange={(e) => handleInputChange('id', e.target.value)}
            disabled={mode === 'edit'}
            required
          />
        </div>

        <div className="eamp-form-field">
          <label htmlFor="eamp-type">Type *</label>
          <select
            id="eamp-type"
            value={formData.type || 'image'}
            onChange={(e) => handleInputChange('type', e.target.value)}
            required
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="ui-element">UI Element</option>
            <option value="document">Document</option>
          </select>
        </div>

        <div className="eamp-form-field">
          <label htmlFor="eamp-short-alt">Short Alt Text *</label>
          <input
            id="eamp-short-alt"
            type="text"
            value={formData.shortAlt || ''}
            onChange={(e) => handleInputChange('shortAlt', e.target.value)}
            required
            maxLength={125}
          />
          <small>Brief, concise description (max 125 characters)</small>
        </div>

        <div className="eamp-form-field">
          <label htmlFor="eamp-extended-description">Extended Description</label>
          <textarea
            id="eamp-extended-description"
            value={formData.extendedDescription || ''}
            onChange={(e) => handleInputChange('extendedDescription', e.target.value)}
            rows={4}
          />
          <small>Detailed description for context and comprehension</small>
        </div>
      </div>

      <div className="eamp-form-section">
        <h3>Tags</h3>
        
        <div className="eamp-form-field">
          <label htmlFor="eamp-tag-input">Add Tag</label>
          <div className="eamp-tag-input-container">
            <input
              id="eamp-tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Enter tag and press Enter"
            />
            <button 
              type="button" 
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {formData.tags && formData.tags.length > 0 && (
          <div className="eamp-tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="eamp-tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)}
                  className="eamp-tag-remove"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="eamp-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : buttonText}
        </button>
      </div>
    </form>
  );
}