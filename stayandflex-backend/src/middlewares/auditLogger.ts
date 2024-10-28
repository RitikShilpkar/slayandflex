import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthenticatedRequest } from './authMiddleware';

export const auditLogger = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  res.on('finish', async () => {
    try {
      if (req.user && ['admin'].includes(req.user.role)) {
        await AuditLog.create({
          admin: req.user._id,
          action: `${req.method} ${req.originalUrl}`,
          // Optionally, include order or other relevant IDs from request parameters
          // For example:
          // order: req.params.id || null,
          details: {
            body: req.body,
            query: req.query,
          },
        });
      }
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  });
  next();
};
