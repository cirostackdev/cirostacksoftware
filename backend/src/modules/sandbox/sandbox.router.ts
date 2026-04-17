import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { sandboxLimiter } from '@/middleware/rateLimit.js';
import { secrets } from '@/config/secrets.js';
import { AppError } from '@/middleware/errorHandler.js';

export const sandboxRouter = Router();

sandboxRouter.post('/run', requireAuth, sandboxLimiter, async (req, res, next) => {
  try {
    const { language, code, stdin, args } = z
      .object({
        language: z.string().min(1),
        code: z.string().min(1),
        stdin: z.string().optional(),
        args: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const pistonUrl = secrets().pistonApiUrl;

    const pistonRes = await fetch(`${pistonUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version: '*',
        files: [{ name: 'main', content: code }],
        stdin: stdin ?? '',
        args: args ?? [],
        run_timeout: 5000,
        compile_timeout: 10000,
      }),
    });

    if (!pistonRes.ok) {
      throw new AppError(502, 'Code execution service unavailable');
    }

    const result = (await pistonRes.json()) as {
      run: { stdout: string; stderr: string; code: number; signal: string | null };
      compile?: { stdout: string; stderr: string; code: number };
    };

    res.json({
      data: {
        stdout: result.run.stdout,
        stderr: result.run.stderr,
        exitCode: result.run.code,
        compileError: result.compile?.stderr ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
});
