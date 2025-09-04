import { EAMPMetadata } from '@eamp/javascript-sdk';
import { MetadataDatabase } from '../services/database.js';
import { WebSocketManager, MetadataUpdateMessage } from '../services/websocket.js';
import logger from './logger.js';

/**
 * Sample EAMP metadata for development and testing
 */
const sampleData: EAMPMetadata[] = [
  {
    id: 'sales-chart-2024',
    type: 'image',
    eampVersion: '1.0.0',
    shortAlt: 'Quarterly sales chart for 2024',
    extendedDescription: 'Bar chart showing steady sales growth throughout 2024. Q1 started at $1.2M, growing to $1.5M in Q2, $1.9M in Q3, and peaking at $2.3M in Q4. The chart uses blue bars on a white background with clear gridlines for accessibility.',
    dataPoints: [
      { label: 'Q1', value: 1200000, unit: 'USD' },
      { label: 'Q2', value: 1500000, unit: 'USD' },
      { label: 'Q3', value: 1900000, unit: 'USD' },
      { label: 'Q4', value: 2300000, unit: 'USD' },
    ],
    visualElements: [
      {
        type: 'chart',
        description: 'Blue vertical bars representing quarterly data',
        position: 'center',
        color: 'blue',
        size: 'large',
      },
      {
        type: 'text',
        description: 'Y-axis labeled Sales (USD) with gridlines',
        position: 'left',
      },
      {
        type: 'text',
        description: 'X-axis labeled with quarters Q1-Q4',
        position: 'bottom',
      },
    ],
    accessibilityFeatures: ['high-contrast', 'screen-reader-optimized'],
    tags: ['finance', 'sales', 'quarterly', '2024'],
    context: {
      pageTitle: 'Q4 2024 Financial Report',
      sectionHeading: 'Sales Performance',
      purpose: 'Illustrate quarterly sales growth trend',
    },
  },
  
  {
    id: 'cooking-tutorial-pasta',
    type: 'video',
    shortAlt: 'Cooking tutorial: Making fresh pasta',
    extendedDescription: 'Step-by-step cooking tutorial showing how to make fresh pasta from scratch, including mixing dough, kneading, rolling, and cutting techniques demonstrated by Chef Maria.',
    transcript: `
Chef Maria: Hello everyone, today we're making fresh pasta from scratch. 
[0:30] First, we'll create a well with our flour on the counter.
[1:15] Now we crack the eggs right into the center of our flour well.
[2:00] Using a fork, we slowly incorporate the flour into the eggs.
[3:30] Once it comes together, we knead the dough for about 8-10 minutes.
[5:00] The dough should be smooth and elastic when ready.
[6:30] Now we roll it out using our pasta machine, starting with the widest setting.
[8:00] Finally, we cut our pasta into the desired shape. And there you have it - fresh homemade pasta!
    `.trim(),
    scenes: [
      {
        time: '0:00-0:30',
        description: 'Introduction with chef in bright kitchen',
        speakers: ['Chef Maria'],
        visualElements: ['kitchen counter', 'pasta ingredients'],
        audioElements: ['upbeat background music'],
      },
      {
        time: '0:31-2:15',
        description: 'Creating flour well and adding eggs',
        speakers: ['Chef Maria'],
        visualElements: ['flour well', 'fresh eggs', 'wooden counter'],
        audioElements: ['chef narration', 'egg cracking sounds'],
      },
      {
        time: '2:16-5:00',
        description: 'Mixing and kneading the pasta dough',
        speakers: ['Chef Maria'],
        visualElements: ['hands kneading', 'pasta dough forming'],
        audioElements: ['kneading sounds', 'detailed instructions'],
      },
      {
        time: '5:01-8:00',
        description: 'Rolling and cutting the pasta',
        speakers: ['Chef Maria'],
        visualElements: ['pasta machine', 'thin pasta sheets', 'cutting technique'],
        audioElements: ['machine sounds', 'cutting sounds'],
      },
    ],
    accessibilityFeatures: ['captions', 'audio-descriptions'],
    tags: ['cooking', 'tutorial', 'pasta', 'italian-cuisine'],
  },
  
  {
    id: 'submit-button-checkout',
    type: 'ui-element',
    shortAlt: 'Complete purchase button',
    extendedDescription: 'Green submit button to complete the checkout process. Button is enabled when all required fields are filled and payment method is selected. Clicking will process the order and redirect to confirmation page. Undo is not available after submission.',
    context: {
      pageTitle: 'Checkout - Secure Payment',
      sectionHeading: 'Order Summary',
      purpose: 'Finalize purchase transaction',
      userTask: 'Complete online purchase',
      surroundingText: 'Review your order details above and click to complete your purchase.',
    },
    accessibilityFeatures: ['keyboard-accessible', 'high-contrast', 'touch-friendly'],
    tags: ['ecommerce', 'button', 'checkout', 'payment'],
  },
  
  {
    id: 'population-growth-chart',
    type: 'image',
    shortAlt: 'World population growth 1900-2020',
    extendedDescription: 'Line chart showing exponential world population growth from 1.6 billion in 1900 to 7.8 billion in 2020. The line shows gradual growth until 1950, then steeper growth between 1950-2000, with the rate of increase slowing slightly in recent decades.',
    dataPoints: [
      { label: '1900', value: 1600000000, unit: 'people' },
      { label: '1950', value: 2500000000, unit: 'people' },
      { label: '2000', value: 6100000000, unit: 'people' },
      { label: '2020', value: 7800000000, unit: 'people' },
    ],
    visualElements: [
      {
        type: 'graph',
        description: 'Blue line graph with exponential curve',
        color: 'blue',
        size: 'large',
      },
      {
        type: 'text',
        description: 'Y-axis shows population in billions',
        position: 'left',
      },
      {
        type: 'text',
        description: 'X-axis shows years from 1900 to 2020',
        position: 'bottom',
      },
    ],
    context: {
      pageTitle: 'Demographics - World History Course',
      sectionHeading: 'Population Trends',
      purpose: 'Illustrate exponential population growth pattern',
      userTask: 'Learn about demographic changes over time',
    },
    accessibilityFeatures: ['high-contrast', 'color-blind-friendly'],
    tags: ['education', 'demographics', 'history', 'statistics'],
  },
  
  {
    id: 'product-sneakers-red',
    type: 'image',
    shortAlt: 'Red running shoes',
    extendedDescription: 'Bright red athletic running shoes with white sole and black accents. Features mesh upper material for breathability, cushioned midsole for comfort, and rubber outsole with traction pattern. Shoes are photographed from a side angle against a white background.',
    visualElements: [
      {
        type: 'photo',
        description: 'Professional product photography of athletic shoes',
        position: 'center',
        color: 'red',
        size: 'large',
      },
    ],
    context: {
      pageTitle: 'Athletic Footwear - Running Shoes',
      sectionHeading: 'Featured Products',
      purpose: 'Showcase product features and design',
      userTask: 'Browse and select running shoes',
    },
    accessibilityFeatures: ['high-contrast', 'zoom-friendly'],
    tags: ['footwear', 'running', 'athletic', 'product', 'red'],
  },
  
  {
    id: 'news-climate-report',
    type: 'document',
    shortAlt: 'Climate change impact report 2024',
    extendedDescription: 'Comprehensive report on climate change impacts observed in 2024, including temperature records, extreme weather events, and environmental consequences. The document contains data visualizations, expert analysis, and policy recommendations.',
    context: {
      pageTitle: 'Climate News - Environmental Reports',
      sectionHeading: 'Latest Research',
      purpose: 'Inform readers about climate change impacts',
      userTask: 'Stay informed about environmental issues',
    },
    accessibilityFeatures: ['screen-reader-optimized', 'high-contrast'],
    tags: ['news', 'climate', 'environment', 'report', '2024'],
  },
];

/**
 * Initialize the database with sample data
 */
export async function initializeSampleData(
  database: MetadataDatabase,
  wsManager: WebSocketManager
): Promise<void> {
  try {
    logger.info('Checking for existing data...');
    
    // Check if data already exists
    const stats = await database.getStats();
    if (stats.totalCount > 0) {
      logger.info(`Database already contains ${stats.totalCount} records, skipping sample data`);
      return;
    }

    logger.info('Loading sample data...');
    
    for (const metadata of sampleData) {
      await database.createMetadata(metadata);
      
      // Simulate real-time update notification
      const updateMessage: MetadataUpdateMessage = {
        type: 'metadata_updated',
        resourceId: metadata.id,
        changeType: 'created',
        timestamp: new Date().toISOString(),
        metadata,
      };
      
      // Broadcast to WebSocket subscribers (if any)
      wsManager.broadcastMetadataUpdate(updateMessage);
    }
    
    logger.info(`Successfully loaded ${sampleData.length} sample metadata records`);
    
  } catch (error) {
    logger.error('Failed to initialize sample data:', error);
    throw error;
  }
}

/**
 * Get a specific sample metadata by ID
 */
export function getSampleMetadata(id: string): EAMPMetadata | undefined {
  return sampleData.find(item => item.id === id);
}

/**
 * Get all sample metadata
 */
export function getAllSampleMetadata(): EAMPMetadata[] {
  return [...sampleData];
}

/**
 * Clear all sample data from database (useful for testing)
 */
export async function clearSampleData(database: MetadataDatabase): Promise<void> {
  logger.info('Clearing sample data...');
  
  for (const metadata of sampleData) {
    await database.deleteMetadata(metadata.id);
  }
  
  logger.info('Sample data cleared');
}