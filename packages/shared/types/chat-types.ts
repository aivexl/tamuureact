/**
 * Chat System Type Definitions
 * Enterprise-grade TypeScript interfaces for Tamuu AI Chat System v8.0
 * 
 * This file provides strict type safety across the entire chat system,
 * ensuring compile-time validation and preventing runtime type errors.
 */

/**
 * User role in chat system
 */
export type UserRole = 'user' | 'model' | 'system' | 'assistant';

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: UserRole;
  content: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation history
 */
export interface ConversationHistory {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  title?: string;
}

/**
 * Intent prediction result
 */
export interface IntentPrediction {
  name: string;
  confidence: number;
  priority: number;
  patterns: RegExp[];
}

/**
 * Intent analysis result with multiple predictions
 */
export interface IntentAnalysis {
  primary: IntentPrediction;
  secondary?: IntentPrediction;
  all: IntentPrediction[];
}

/**
 * User profile enrichment data
 */
export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'ultimate' | 'elite';
  createdAt: string;
  expiresAt?: string;
  invitationCount: number;
  transactionCount: number;
  lastActive?: string;
}

/**
 * Behavioral insights from user activity
 */
export interface BehavioralInsights {
  purchaseBehavior: {
    frequency: number;
    averageSpend: number;
    upgradePattern: string;
  };
  engagementLevel: 'low' | 'medium' | 'high' | 'power_user';
  supportHistory: SupportTicket[];
  featureUsage: FeatureUsageMetrics;
}

/**
 * Support ticket structure
 */
export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  daysOpen: number;
  resolved: boolean;
}

/**
 * Feature usage metrics
 */
export interface FeatureUsageMetrics {
  invitations: {
    created: number;
    activeDays: number;
  };
  templates: {
    used: number;
  };
  rsvpTracking: {
    totalResponses: number;
    confirmedResponses: number;
    responseRate: number;
  };
  analytics: {
    trackedInvitations: number;
  };
  lastActive: string;
}

/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  timestamp: string;
}

/**
 * Enhanced context for AI processing
 */
export interface EnhancedContext {
  userProfile?: UserProfile;
  behavioralInsights: BehavioralInsights;
  predictedIntent: IntentAnalysis;
  systemHealth: SystemHealth;
  sessionData: SessionData;
  timestamp: string;
  performance: {
    contextBuildTime: number;
    cacheHit: boolean;
  };
}

/**
 * Session data for conversation tracking
 */
export interface SessionData {
  queryPatterns: string[];
  frustrationLevel: number;
  successRate: number;
  lastInteraction?: string;
  preferences: Record<string, unknown>;
}

/**
 * Gemini API response
 */
export interface GeminiResponse {
  content: string;
  metadata: {
    provider: string;
    responseTime: number;
    modelVersion: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

/**
 * Fallback AI response
 */
export interface FallbackResponse {
  content: string;
  metadata: {
    provider: 'fallback' | 'error-handler';
    error?: string;
    fallback: boolean;
  };
}

/**
 * Union type for AI responses
 */
export type AIResponse = GeminiResponse | FallbackResponse;

/**
 * Chat API request
 */
export interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
  sessionId?: string;
  context?: Partial<EnhancedContext>;
}

/**
 * Chat API response
 */
export interface ChatResponse {
  content: string;
  provider: string;
  metadata: {
    responseTime: number;
    contextUsed: boolean;
    toolsExecuted: number;
    error?: string;
    fallback?: boolean;
  };
}

/**
 * Diagnostic tool result
 */
export interface DiagnosticToolResult {
  tool: string;
  data: Record<string, unknown>;
  timestamp?: string;
  success?: boolean;
}

/**
 * Payment diagnostic data
 */
export interface PaymentDiagnostics extends DiagnosticToolResult {
  tool: 'payment_diagnostics';
  data: {
    recentTransactions: Array<{
      id: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    failedPayments: Array<{
      id: string;
      amount: number;
      status: string;
    }>;
    recommendation: string;
    autoFixAvailable: boolean;
  };
}

/**
 * Upgrade analysis data
 */
export interface UpgradeAnalysis extends DiagnosticToolResult {
  tool: 'upgrade_analysis';
  data: {
    currentTier: 'free' | 'pro' | 'ultimate' | 'elite';
    nextTier?: string;
    upgradeHistory: Array<{
      id: string;
      amount: number;
      status: string;
    }>;
    recommendation: string;
    benefits: string[];
  };
}

/**
 * Account diagnostics data
 */
export interface AccountDiagnostics extends DiagnosticToolResult {
  tool: 'account_diagnostics';
  data: {
    accountAge: number;
    subscriptionStatus: 'active' | 'expired' | 'unknown';
    expiresAt?: string;
    loginActivity: Array<{
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
    }>;
    securityStatus: {
      status: 'secure' | 'warning' | 'unknown';
      issues?: string[];
    };
    recommendation: string;
  };
}

/**
 * Union type for all diagnostic results
 */
export type DiagnosticResult = PaymentDiagnostics | UpgradeAnalysis | AccountDiagnostics | DiagnosticToolResult;

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Rate limit metadata
 */
export interface RateLimitMetadata {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
  exceeded: boolean;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  expired: boolean;
}

/**
 * Session persistence structure
 */
export interface PersistedSession {
  id: string;
  userId: string;
  conversationHistory: ChatMessage[];
  context: Partial<EnhancedContext>;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

/**
 * Admin chat request with elevated permissions
 */
export interface AdminChatRequest extends ChatRequest {
  adminId: string;
  targetUserId: string;
  adminLevel: 'moderator' | 'admin' | 'super_admin';
  auditLog: boolean;
}

/**
 * Admin chat response with audit trail
 */
export interface AdminChatResponse extends ChatResponse {
  auditId?: string;
  executedPrivilegedActions?: string[];
}

/**
 * Validation schema for input sanitization
 */
export interface ValidationSchema {
  maxLength: number;
  minLength: number;
  allowedChars: RegExp;
  blockedPatterns: RegExp[];
}

/**
 * Sanitization result
 */
export interface SanitizationResult {
  original: string;
  sanitized: string;
  isSafe: boolean;
  violations: string[];
}

/**
 * Exponential backoff configuration
 */
export interface BackoffConfig {
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
  maxRetries: number;
  jitterFactor: number;
}

/**
 * Retry state for exponential backoff
 */
export interface RetryState {
  attempt: number;
  delay: number;
  nextRetryTime: number;
  totalDelay: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  totalRequests: number;
  successfulResponses: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

/**
 * Tone configuration for persona
 */
export interface ToneConfig {
  formal: number;
  technical: number;
  friendly: number;
}

/**
 * User persona type
 */
export type UserPersona = 'power_user' | 'active_creator' | 'premium_user' | 'new_user' | 'standard';

/**
 * Gemini API error types
 */
export enum GeminiErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_API_KEY = 'INVALID_API_KEY',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured error for chat system
 */
export interface ChatError extends Error {
  code: GeminiErrorType;
  statusCode: number;
  isRetryable: boolean;
  originalError: unknown;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlags {
  enableDiagnostics: boolean;
  enableSilentDiagnostics: boolean;
  enableCaching: boolean;
  enableRateLimit: boolean;
  enableExponentialBackoff: boolean;
  enableInputSanitization: boolean;
  enableSessionPersistence: boolean;
}

/**
 * Configuration for entire chat system
 */
export interface ChatSystemConfig {
  geminiApiKey: string;
  groqApiKey?: string;
  rateLimitConfig: RateLimitConfig;
  backoffConfig: BackoffConfig;
  featureFlags: FeatureFlags;
  cacheTimeout: number;
  databaseUrl: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    geminiApi: boolean;
    database: boolean;
    cache: boolean;
  };
  metrics: PerformanceMetrics;
}
