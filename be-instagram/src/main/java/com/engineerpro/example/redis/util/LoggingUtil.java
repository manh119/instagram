package com.engineerpro.example.redis.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility class for standardized logging across the application
 * Provides methods for different logging levels and contexts
 */
public class LoggingUtil {
    
    private static final String REQUEST_ID_KEY = "requestId";
    
    /**
     * Get logger for the calling class
     */
    public static Logger getLogger() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        String className = stackTrace[2].getClassName();
        return LoggerFactory.getLogger(className);
    }
    
    /**
     * Get logger for a specific class
     */
    public static Logger getLogger(Class<?> clazz) {
        return LoggerFactory.getLogger(clazz);
    }
    
    /**
     * Get current request ID from MDC
     */
    public static String getCurrentRequestId() {
        return MDC.get(REQUEST_ID_KEY);
    }
    
    /**
     * CONTROLLER LOGGING METHODS
     */
    
    /**
     * Log controller entry with method name and parameters
     */
    public static void logControllerEntry(Logger logger, String methodName, Object... params) {
        String requestId = getCurrentRequestId();
        logger.info("[CONTROLLER_ENTRY] Method: {} | RequestId: {} | Params: {}", 
                   methodName, requestId, formatParams(params));
    }
    
    /**
     * Log controller exit with method name and result
     */
    public static void logControllerExit(Logger logger, String methodName, Object result) {
        String requestId = getCurrentRequestId();
        logger.info("[CONTROLLER_EXIT] Method: {} | RequestId: {} | Result: {}", 
                   methodName, requestId, sanitizeSensitiveData(result));
    }
    
    /**
     * Log controller error with method name and exception
     */
    public static void logControllerError(Logger logger, String methodName, Exception e) {
        String requestId = getCurrentRequestId();
        logger.error("[CONTROLLER_ERROR] Method: {} | RequestId: {} | Error: {} | StackTrace: {}", 
                    methodName, requestId, e.getMessage(), getStackTrace(e));
    }
    
    /**
     * SERVICE LOGGING METHODS
     */
    
    /**
     * Log business event (INFO level)
     */
    public static void logBusinessEvent(Logger logger, String event, Object... details) {
        String requestId = getCurrentRequestId();
        logger.info("[BUSINESS_EVENT] {} | RequestId: {} | Details: {}", 
                   event, requestId, formatParams(details));
    }
    
    /**
     * Log service processing details (DEBUG level)
     */
    public static void logServiceDebug(Logger logger, String operation, Object... details) {
        String requestId = getCurrentRequestId();
        logger.debug("[SERVICE_DEBUG] {} | RequestId: {} | Details: {}", 
                    operation, requestId, formatParams(details));
    }
    
    /**
     * Log service warning (WARN level)
     */
    public static void logServiceWarning(Logger logger, String warning, Object... details) {
        String requestId = getCurrentRequestId();
        logger.warn("[SERVICE_WARNING] {} | RequestId: {} | Details: {}", 
                   warning, requestId, formatParams(details));
    }
    
    /**
     * REPOSITORY LOGGING METHODS
     */
    
    /**
     * Log repository save/update operations (DEBUG level)
     */
    public static void logRepositoryOperation(Logger logger, String operation, String entityType, Object entityId) {
        String requestId = getCurrentRequestId();
        logger.debug("[REPOSITORY_OP] {} | Entity: {} | ID: {} | RequestId: {}", 
                    operation, entityType, entityId, requestId);
    }
    
    /**
     * Log repository query details (TRACE level)
     */
    public static void logRepositoryQuery(Logger logger, String queryType, String details) {
        String requestId = getCurrentRequestId();
        logger.trace("[REPOSITORY_QUERY] {} | Details: {} | RequestId: {}", 
                    queryType, details, requestId);
    }
    
    /**
     * UTILITY METHODS
     */
    
    private static String formatParams(Object... params) {
        if (params == null || params.length == 0) {
            return "none";
        }
        
        return Arrays.stream(params)
                .map(param -> sanitizeSensitiveData(param))
                .collect(Collectors.joining(", "));
    }
    
    private static String sanitizeSensitiveData(Object data) {
        if (data == null) {
            return "null";
        }
        
        String dataStr = data.toString();
        
        // Remove sensitive information patterns
        if (dataStr.contains("password") || dataStr.contains("token") || 
            dataStr.contains("secret") || dataStr.contains("card") ||
            dataStr.contains("jwt") || dataStr.contains("authorization")) {
            return "[SENSITIVE_DATA_REMOVED]";
        }
        
        // Limit length to prevent log flooding
        if (dataStr.length() > 500) {
            return dataStr.substring(0, 500) + "... [TRUNCATED]";
        }
        
        return dataStr;
    }
    
    private static String getStackTrace(Exception e) {
        return Arrays.stream(e.getStackTrace())
                .limit(5) // Limit stack trace depth
                .map(StackTraceElement::toString)
                .collect(Collectors.joining(" | "));
    }
    
    /**
     * Log method entry with automatic method name detection
     */
    public static void logEntry(Logger logger, Object... params) {
        String methodName = getCallingMethodName();
        logControllerEntry(logger, methodName, params);
    }
    
    /**
     * Log method exit with automatic method name detection
     */
    public static void logExit(Logger logger, Object result) {
        String methodName = getCallingMethodName();
        logControllerExit(logger, methodName, result);
    }
    
    /**
     * Log method error with automatic method name detection
     */
    public static void logError(Logger logger, Exception e) {
        String methodName = getCallingMethodName();
        logControllerError(logger, methodName, e);
    }
    
    private static String getCallingMethodName() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        return stackTrace[3].getMethodName();
    }
}
