import { describe, it, expect } from '@jest/globals';
import {
  eampMetadataSchema,
  dataPointSchema,
  visualElementSchema,
  contextSchema,
  sceneSchema,
  EAMPMetadata,
  DataPoint,
  VisualElement,
  Context,
  Scene
} from '../../types/metadata';

describe('EAMP Metadata Schemas', () => {
  describe('DataPoint Schema', () => {
    it('should validate a valid data point', () => {
      const validDataPoint: DataPoint = {
        label: 'Q1 Sales',
        value: 1200000,
        unit: 'USD'
      };

      const result = dataPointSchema.safeParse(validDataPoint);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validDataPoint);
      }
    });

    it('should reject data point with missing required fields', () => {
      const invalidDataPoint = {
        label: 'Q1 Sales'
        // missing value and unit
      };

      const result = dataPointSchema.safeParse(invalidDataPoint);
      expect(result.success).toBe(false);
    });

    it('should handle string values that can be converted to numbers', () => {
      const dataPointWithStringValue = {
        label: 'Temperature',
        value: '25.5',
        unit: 'Celsius'
      };

      const result = dataPointSchema.safeParse(dataPointWithStringValue);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.value).toBe('number');
        expect(result.data.value).toBe(25.5);
      }
    });
  });

  describe('VisualElement Schema', () => {
    it('should validate a valid visual element', () => {
      const validElement: VisualElement = {
        type: 'chart',
        description: 'Blue bar chart showing quarterly data',
        position: 'center',
        color: '#0066CC',
        size: 'large'
      };

      const result = visualElementSchema.safeParse(validElement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validElement);
      }
    });

    it('should validate minimal visual element with only required fields', () => {
      const minimalElement = {
        type: 'text',
        description: 'Y-axis labels'
      };

      const result = visualElementSchema.safeParse(minimalElement);
      expect(result.success).toBe(true);
    });

    it('should reject invalid element type', () => {
      const invalidElement = {
        type: 'invalid-type',
        description: 'Some description'
      };

      const result = visualElementSchema.safeParse(invalidElement);
      expect(result.success).toBe(false);
    });
  });

  describe('Context Schema', () => {
    it('should validate a complete context object', () => {
      const validContext: Context = {
        pageTitle: 'Q4 2024 Financial Report',
        sectionHeading: 'Sales Performance',
        purpose: 'Illustrate quarterly sales growth trend',
        userTask: 'Analyze sales performance over time',
        surroundingText: 'The chart shows consistent growth'
      };

      const result = contextSchema.safeParse(validContext);
      expect(result.success).toBe(true);
    });

    it('should validate empty context object', () => {
      const emptyContext = {};

      const result = contextSchema.safeParse(emptyContext);
      expect(result.success).toBe(true);
    });
  });

  describe('Scene Schema', () => {
    it('should validate a complete scene object', () => {
      const validScene: Scene = {
        time: '0:30-2:15',
        description: 'Chef mixing flour and eggs',
        speakers: ['Chef Maria'],
        visualElements: ['flour well', 'fresh eggs'],
        audioElements: ['chef narration', 'mixing sounds']
      };

      const result = sceneSchema.safeParse(validScene);
      expect(result.success).toBe(true);
    });

    it('should validate minimal scene with only required fields', () => {
      const minimalScene = {
        time: '0:00-0:30',
        description: 'Opening scene'
      };

      const result = sceneSchema.safeParse(minimalScene);
      expect(result.success).toBe(true);
    });
  });

  describe('EAMPMetadata Schema', () => {
    it('should validate a complete EAMP metadata object', () => {
      const validMetadata: EAMPMetadata = {
        id: 'sales-chart-2024',
        type: 'image',
        eampVersion: '1.0.0',
        shortAlt: 'Quarterly sales chart for 2024',
        extendedDescription: 'Bar chart showing steady sales growth throughout 2024',
        dataPoints: [
          { label: 'Q1', value: 1200000, unit: 'USD' },
          { label: 'Q2', value: 1500000, unit: 'USD' }
        ],
        visualElements: [
          {
            type: 'chart',
            description: 'Blue vertical bars',
            position: 'center',
            color: 'blue'
          }
        ],
        accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'],
        tags: ['finance', 'sales', 'quarterly'],
        context: {
          pageTitle: 'Financial Report',
          purpose: 'Show sales trends'
        }
      };

      const result = eampMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('sales-chart-2024');
        expect(result.data.type).toBe('image');
        expect(result.data.dataPoints).toHaveLength(2);
      }
    });

    it('should validate minimal metadata with only required fields', () => {
      const minimalMetadata = {
        id: 'test-resource',
        type: 'image',
        eampVersion: '1.0.0',
        shortAlt: 'Test image'
      };

      const result = eampMetadataSchema.safeParse(minimalMetadata);
      expect(result.success).toBe(true);
    });

    it('should reject metadata with missing required fields', () => {
      const invalidMetadata = {
        id: 'test-resource',
        type: 'image'
        // missing eampVersion and shortAlt
      };

      const result = eampMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it('should reject metadata with invalid type', () => {
      const invalidMetadata = {
        id: 'test-resource',
        type: 'invalid-type',
        eampVersion: '1.0.0',
        shortAlt: 'Test content'
      };

      const result = eampMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it('should validate video metadata with transcript and scenes', () => {
      const videoMetadata: EAMPMetadata = {
        id: 'cooking-tutorial',
        type: 'video',
        eampVersion: '1.0.0',
        shortAlt: 'Pasta making tutorial',
        extendedDescription: 'Step-by-step pasta making tutorial',
        transcript: 'Chef Maria: Today we\'re making fresh pasta...',
        scenes: [
          {
            time: '0:00-0:30',
            description: 'Introduction with chef in kitchen',
            speakers: ['Chef Maria']
          }
        ]
      };

      const result = eampMetadataSchema.safeParse(videoMetadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('video');
        expect(result.data.transcript).toBeDefined();
        expect(result.data.scenes).toHaveLength(1);
      }
    });

    it('should enforce shortAlt length constraint', () => {
      const longAltMetadata = {
        id: 'test-resource',
        type: 'image',
        eampVersion: '1.0.0',
        shortAlt: 'A'.repeat(130) // Exceeds 125 character limit
      };

      const result = eampMetadataSchema.safeParse(longAltMetadata);
      expect(result.success).toBe(false);
    });
  });
});