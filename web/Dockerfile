FROM node:20-alpine AS build
WORKDIR /web
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /web
COPY --from=build /web/package.json ./package.json
COPY --from=build /web/node_modules ./node_modules
COPY --from=build /web/dist ./dist
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
