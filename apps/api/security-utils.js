/**
 * Input Sanitization Module for Chat System (JS Version)
 * Enterprise-grade input validation and XSS/injection prevention
 */

const SANITIZATION_SCHEMAS = {
  chatMessage: {
    maxLength: 5000,
    minLength: 1,
    // Removed strict allowedChars whitelist to support Emojis and other languages.
    // We rely on blockedPatterns and HTML encoding for security.
    allowedChars: null,
    blockedPatterns: [
      /(<script|<iframe|<object|<embed|<img|<link|<meta|javascript:|onerror=|onload=|onclick=|onmouseover=)/gi,
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

class InputSanitizer {
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
      return { valid: false, messages: [], userId: null, violations };
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

  static sanitizeForDatabase(input) {
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'UNION', 'WHERE', 'EXEC', 'EXECUTE'
    ];

    let sanitized = input;

    for (const keyword of sqlKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }

    sanitized = sanitized.replace(/[;\\''""]/g, '');

    return sanitized;
  }
}

function sanitizationMiddleware(request) {
  try {
    if (request.messages && request.userId !== undefined) {
      return InputSanitizer.validateChatRequest(request);
    }

    return {
      valid: false,
      sanitized: null,
      violations: { request: ['Invalid request structure'] }
    };
  } catch (error) {
    console.error('[Sanitizer] Error in middleware:', error);
    return {
      valid: false,
      sanitized: null,
      violations: { error: ['Sanitization middleware error'] }
    };
  }
}

function verifyAdmin(request, env) {
    const secret = request.headers.get('X-Admin-Secret');
    // If ADMIN_SECRET is not set in env, we default to blocking access for safety
    if (!env.ADMIN_SECRET) {
        console.error('[Security] ADMIN_SECRET not configured in environment.');
        return false;
    }
    return secret === env.ADMIN_SECRET;
}

export { InputSanitizer, sanitizationMiddleware, verifyAdmin, SANITIZATION_SCHEMAS };
