# שלב 1: בניית הפרויקט
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# שלב 2: הגשה עם Nginx (שרת אינטרנט קליל)
FROM nginx:alpine

# מעתיקים את תוצאת הבנייה משלב 1 לתיקייה של Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# חושפים את פורט 80
EXPOSE 80

# מריצים את Nginx
CMD ["nginx", "-g", "daemon off;"]
