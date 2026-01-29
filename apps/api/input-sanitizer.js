// apps/api/input-sanitizer.js

/**
 * Sanitization schemas for different input types
 */
const SANITIZATION_SCHEMAS = {
  chatMessage: {
    maxLength: 5000,
    minLength: 1,
    // Allow all characters (including Emojis) but rely on blockedPatterns for security
    allowedChars: /^[\s\S]*$/,
    blockedPatterns: [
      /(<script|<iframe|<object|<embed|<img|<link|<meta|javascript:|onerror=|onload=|onclick=|onmouseover=)/gi,
      /(union\s+select|select\s+|insert\s+|update\s+|delete\s+|drop\s+|create\s+|alter\s+)/gi,
      /(\$\{|{{|<%|{%|\$\()/g
    ]
  },
  userId: {
    maxLength: 36,
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
    maxLength: 64,
    minLength: 1,
    allowedChars: /^[a-zA-Z0-9\-]*$/,
    blockedPatterns: []
  }
};

export class InputSanitizer {
  static sanitizeChatMessage(message) {
    return this.sanitizeInput(message, 'chatMessage');
  }

  static sanitizeUserId(userId) {
    return this.sanitizeInput(userId, 'userId');
  }

  static sanitizeEmail(email) {
    return this.sanitizeInput(email, 'email');
  }

  static sanitizeSessionId(sessionId) {
    return this.sanitizeInput(sessionId, 'sessionId');
  }

  static sanitizeInput(input, schemaType) {
    const violations = [];
    let isSafe = true;

    if (!input || typeof input !== 'string') {
      violations.push('Input is not a valid string');
      return { sanitized: '', isSafe: false, violations };
    }

    const schema = SANITIZATION_SCHEMAS[schemaType];
    let sanitized = input.trim();

    if (sanitized.length < schema.minLength) {
      violations.push(`Input too short (minimum: ${schema.minLength})`);
      isSafe = false;
    }

    if (sanitized.length > schema.maxLength) {
      violations.push(`Input too long (maximum: ${schema.maxLength})`);
      sanitized = sanitized.substring(0, schema.maxLength);
      isSafe = false;
    }

    for (const pattern of schema.blockedPatterns) {
      if (pattern.test(input)) {
        violations.push(`Detected potentially malicious pattern: ${pattern.source}`);
        isSafe = false;
        sanitized = sanitized.replace(pattern, '');
      }
    }

    const invalidChars = sanitized.split('').filter((char) => !schema.allowedChars.test(char));
    if (invalidChars.length > 0) {
      violations.push(`Contains invalid characters: ${[...new Set(invalidChars)].join(', ')}`);
      isSafe = false;
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\.,!?\-'"\(\)\@\#\$\%\&\=\+\~\^\*\/\\\|\:\;áéíóúàèìòùäëïöüâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÃÕÑÇ]/g, '');
    }

    sanitized = this.htmlEncode(sanitized);

    return { sanitized, isSafe, violations };
  }

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

  static validateChatRequest(request) {
    const violations = {};

    if (!Array.isArray(request.messages)) {
      violations.messages = ['Messages must be an array'];
    }

    const sanitizedMessages = (request.messages || [])
      .filter((msg) => msg && typeof msg === 'object')
      .map((msg) => {
        const contentResult = this.sanitizeChatMessage(msg.content || '');

        if (!contentResult.isSafe) {
          violations[`message_${msg.role}`] = contentResult.violations;
        }

        return {
          role: msg.role || 'user',
          content: contentResult.sanitized
        };
      });

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

  static detectSilentDiagnosticExploit(message, isAuthorized) {
    const suspiciousPatterns = [/audit\s+diagnostik/gi, /diagnostik\s+diam/gi, /silent\s+diag/gi];
    const hasSuspiciousPattern = suspiciousPatterns.some((pattern) => pattern.test(message));
    if (hasSuspiciousPattern && !isAuthorized) {
      return true;
    }
    return false;
  }
}

export { SANITIZATION_SCHEMAS };
