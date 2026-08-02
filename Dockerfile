FROM node:24.18.1-alpine

WORKDIR /app
COPY relay-node.mjs server.mjs ./

ENV NODE_ENV=production
ENV PORT=8787
USER node
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health >/dev/null || exit 1

CMD ["node", "server.mjs"]
