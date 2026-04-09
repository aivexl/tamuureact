/**
 * Input Sanitization Module for Chat System
 * Enterprise-grade input validation and XSS/injection prevention
 */

/**
 * Sanitization schemas for different input types
 */
const SANITIZATION_SCHEMAS = {
  chatMessage: {
    maxLength: 5000,
    minLength: 1,
    allowedChars: /^[a-zA-Z0-9\s\.,!?\-'"\(\)\@\#\$\%\&\=\+\~\^\*\/\\\|\:\;áéíóúàèìòùäëïöüâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÃÕÑÇ]*$/,
    blockedPatterns: [
      /(<script|<iframe|<object|<embed|<img|<link|<meta|javascript:|onerror=|onload=|onclick=|onmouseover=)/gi,
      /(union\s+select|select\s+|insert\s+|update\s+|delete\s+|drop\s+|create\s+|alter\s+)/gi,
      /(\$\{|{{|<%|{%|\$\()/g
    ]
  },
  userId: {
    maxLength: 128, // Extended for various UUID formats
    minLength: 1,
    allowedChars: /^[a-zA-Z0-9\-_]*$/,
    blockedPatterns: []
  },
  email: {
    maxLength: 255,
    minLength: 5,
    allowedChars: /^[a-zA-Z0-9\.\_\-\@]+$/,
    blockedPatterns: [/(<|>|"|'|;|\\)/g]
  },
  sessionId: {
    maxLength: 128,
    minLength: 1,
    allowedChars: /^[a-zA-Z0-9\-]*$/,
    blockedPatterns: []
  }
};

/**
 * Sanitizer class for enterprise-grade input validation
 */
export class InputSanitizer {
  /**
   * Sanitize chat message input
   */
  static sanitizeChatMessage(message) {
    return this.sanitizeInput(message, 'chatMessage');
  }

  /**
   * Sanitize user ID
   */
  static sanitizeUserId(userId) {
    return this.sanitizeInput(userId, 'userId');
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email) {
    return this.sanitizeInput(email, 'email');
  }

  /**
   * Core sanitization logic
   */
  static sanitizeInput(input, schemaType) {
    const violations = [];
    let isSafe = true;

    // Null/undefined check
    if (!input || typeof input !== 'string') {
      violations.push('Input is not a valid string');
      return { sanitized: '', isSafe: false, violations };
    }

    const schema = SANITIZATION_SCHEMAS[schemaType];
    let sanitized = input.trim();

    // Length validation
    if (sanitized.length < schema.minLength) {
      violations.push(`Input too short (minimum: ${schema.minLength})`);
      isSafe = false;
    }

    if (sanitized.length > schema.maxLength) {
      violations.push(`Input too long (maximum: ${schema.maxLength})`);
      sanitized = sanitized.substring(0, schema.maxLength);
      isSafe = false;
    }

    // Check for blocked patterns
    for (const pattern of schema.blockedPatterns) {
      if (pattern.test(input)) {
        violations.push(`Detected potentially malicious pattern: ${pattern.source}`);
        isSafe = false;
        // Remove the blocked pattern
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Check character whitelist
    // We use a broader approach for character check to be more international-friendly
    // but still restrictive on special symbols commonly used in injections
    const invalidChars = sanitized.split('').filter((char) => !schema.allowedChars.test(char));
    if (invalidChars.length > 0) {
      violations.push(`Contains invalid characters: ${[...new Set(invalidChars)].join(', ')}`);
      isSafe = false;
      // Remove invalid characters based on the schema's specific disallowed pattern if we had one,
      // here we just filter the string.
      sanitized = sanitized.split('').filter(char => schema.allowedChars.test(char)).join('');
    }

    // HTML encode special characters
    sanitized = this.htmlEncode(sanitized);

    return { sanitized, isSafe, violations };
  }

  /**
   * HTML encode special characters to prevent XSS
   */
  static htmlEncode(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return str.replace(/[&<>"'\/]/g, (char) => map[char]);
  }

  /**
   * Validate and sanitize entire chat request
   */
  static validateChatRequest(request) {
    const violations = {};

    // Validate messages array
    if (!Array.isArray(request.messages)) {
      violations.messages = ['Messages must be an array'];
    }

    const sanitizedMessages = (request.messages || [])
      .filter((msg) => msg && typeof msg === 'object')
      .map((msg) => {
        const contentResult = this.sanitizeChatMessage(msg.content || '');

        if (!contentResult.isSafe) {
          violations[`message_${msg.role || 'user'}`] = contentResult.violations;
        }

        return {
          role: msg.role || 'user',
          content: contentResult.sanitized
        };
      });

    // Validate userId if provided
    let sanitizedUserId = null;
    if (request.userId) {
      const userIdResult = this.sanitizeUserId(request.userId);

      if (!userIdResult.isSafe) {
        violations.userId = userIdResult.violations;
      }

      sanitizedUserId = userIdResult.sanitized;
    }

    const isValid = Object.keys(violations).length === 0;

    return {
      valid: isValid,
      messages: sanitizedMessages,
      userId: sanitizedUserId,
      violations
    };
  }
}

/**
 * Middleware for automatic input sanitization
 */
export function sanitizationMiddleware(requestBody) {
  try {
    if (requestBody.messages) {
      return InputSanitizer.validateChatRequest(requestBody);
    }

    return {
      valid: false,
      sanitized: null,
      violations: { request: ['Invalid request structure'] }
    };
  } catch (error) {
    console.error('[Sanitizer] Error:', error);
    return {
      valid: false,
      sanitized: null,
      violations: { error: ['Sanitization error'] }
    };
  }
}
