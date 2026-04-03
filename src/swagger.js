import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Nature Travels API',
    version: '1.0.0',
    description: 'Swagger/OpenAPI documentation for Nature Travels API',
  },
  servers: [
    {
      url: 'nature-travels-backend.onrender.com',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Stories' },
    { name: 'Users' },
    { name: 'Categories' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Номер сторінки',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      },
      PerPageStoriesParam: {
        name: 'perPage',
        in: 'query',
        description: 'Кількість елементів на сторінці',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 10,
        },
      },
      PerPageUsersParam: {
        name: 'perPage',
        in: 'query',
        description: 'Кількість користувачів на сторінці',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          default: 10,
        },
      },
      StoryIdParam: {
        name: 'storyId',
        in: 'path',
        required: true,
        description: 'ID story',
        schema: {
          type: 'string',
          example: '68498236a100312bea018fe6',
        },
      },
      UserIdParam: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'ID користувача',
        schema: {
          type: 'string',
          example: '6881563901add19ee16fd011',
        },
      },
      VerifyTokenParam: {
        name: 'token',
        in: 'path',
        required: true,
        description: 'Токен підтвердження email',
        schema: {
          type: 'string',
          example: 'x7A9cQ2kLmN8pRtY',
        },
      },
      CategoryQuery: {
        name: 'category',
        in: 'query',
        description: 'ID категорії для фільтрації stories',
        schema: {
          type: 'string',
          example: '6966a5cdbc1b90f344c2e0bd',
        },
      },
      TitleQuery: {
        name: 'title',
        in: 'query',
        description: 'Пошук за title, мінімум 3 символи',
        schema: {
          type: 'string',
          minLength: 3,
          example: 'Карпати',
        },
      },
      RateQuery: {
        name: 'rate',
        in: 'query',
        description: 'Фільтрація за rate',
        schema: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          example: 10,
        },
      },
      SortByQuery: {
        name: 'sortBy',
        in: 'query',
        description: 'Поле сортування',
        schema: {
          type: 'string',
          enum: ['_id', 'title', 'category', 'rate', 'date', 'createdAt'],
          default: '_id',
        },
      },
      SortOrderQuery: {
        name: 'sortOrder',
        in: 'query',
        description: 'Порядок сортування',
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'asc',
        },
      },
      SearchQuery: {
        name: 'search',
        in: 'query',
        description: 'Пошуковий рядок',
        schema: {
          type: 'string',
          example: 'богдан',
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'integer',
            example: 404,
          },
          message: {
            type: 'string',
            example: 'Resource not found',
          },
        },
        required: ['statusCode', 'message'],
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Success',
          },
        },
        required: ['message'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 32,
            example: 'Богдан Коваль',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 64,
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'StrongPass123',
          },
        },
        required: ['name', 'email', 'password'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'StrongPass123',
          },
        },
        required: ['email', 'password'],
      },
      AuthUser: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '6881563901add19ee16fd011',
          },
          name: {
            type: 'string',
            example: 'Богдан Коваль',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          avatarUrl: {
            type: 'string',
            nullable: true,
            example: null,
          },
        },
      },
      SessionTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Login successful',
          },
          user: {
            $ref: '#/components/schemas/AuthUser',
          },
          tokens: {
            $ref: '#/components/schemas/SessionTokens',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '6966a5cdbc1b90f344c2e0bd',
          },
          category: {
            type: 'string',
            example: 'Карпати',
          },
        },
        required: ['_id', 'category'],
      },
      Story: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '68498236a100312bea018fe6',
          },
          img: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/story.webp',
          },
          category: {
            oneOf: [
              { $ref: '#/components/schemas/Category' },
              {
                type: 'string',
                example: '6966a5cdbc1b90f344c2e0bd',
              },
            ],
          },
          title: {
            type: 'string',
            example: 'Закарпатські винні тури',
          },
          article: {
            type: 'string',
            example: 'Закарпаття відоме не лише своїми горами...',
          },
          rate: {
            type: 'number',
            default: 0,
            example: 12,
          },
          ownerId: {
            type: 'string',
            example: '6881563901add19ee16fd011',
          },
          date: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T10:00:00.000Z',
          },
          savedCount: {
            type: 'integer',
            default: 0,
            example: 3,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T10:05:00.000Z',
          },
        },
        required: ['_id', 'img', 'category', 'title', 'article', 'ownerId'],
      },
      StoryCreateRequest: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            example: '6966a5cdbc1b90f344c2e0bd',
          },
          title: {
            type: 'string',
            minLength: 3,
            example: 'Some test article',
          },
          article: {
            type: 'string',
            minLength: 3,
            example: 'TEST — це край мальовничих сіл...',
          },
          img: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['category', 'title', 'article', 'img'],
      },
      StoriesListResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          perPage: {
            type: 'integer',
            example: 10,
          },
          totalItems: {
            type: 'integer',
            example: 48,
          },
          totalPages: {
            type: 'integer',
            example: 5,
          },
          stories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Story',
            },
          },
        },
        required: ['page', 'perPage', 'totalItems', 'totalPages', 'stories'],
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '6881563901add19ee16fd011',
          },
          name: {
            type: 'string',
            example: 'Богдан Коваль',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          avatarUrl: {
            type: 'string',
            nullable: true,
            example: null,
          },
          savedStories: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                { $ref: '#/components/schemas/Story' },
              ],
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T10:05:00.000Z',
          },
        },
        required: ['_id', 'name', 'email'],
      },
      UserUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 32,
            example: "Оновлене ім'я",
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 64,
            example: 'newmail@example.com',
          },
        },
      },
      UsersListResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          perPage: {
            type: 'integer',
            example: 10,
          },
          totalItems: {
            type: 'integer',
            example: 20,
          },
          totalPages: {
            type: 'integer',
            example: 2,
          },
          users: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
      UserProfileResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          stories: {
            $ref: '#/components/schemas/StoriesListResponse',
          },
          savedStories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Story',
            },
          },
        },
      },
      AvatarUploadResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Avatar updated successfully',
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/avatar.webp',
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Реєстрація користувача',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Користувача успішно зареєстровано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          400: {
            description: 'Помилка валідації',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          409: {
            description: 'Користувач уже існує',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вхід користувача',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Успішний вхід',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          400: {
            description: 'Помилка валідації',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Невірний email або пароль',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Оновити сесію користувача',
        responses: {
          200: {
            description: 'Сесію успішно оновлено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          401: {
            description: 'Сесію не знайдено або refresh token недійсний',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Вихід користувача',
        responses: {
          200: {
            description: 'Успішний вихід',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },
          401: {
            description: 'Користувач неавторизований або сесію не знайдено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Отримати всі категорії',
        responses: {
          200: {
            description: 'Категорії успішно отримано',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Category',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/stories': {
      get: {
        tags: ['Stories'],
        summary: 'Отримати список stories',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PerPageStoriesParam' },
          { $ref: '#/components/parameters/CategoryQuery' },
          { $ref: '#/components/parameters/TitleQuery' },
          { $ref: '#/components/parameters/RateQuery' },
          { $ref: '#/components/parameters/SortByQuery' },
          { $ref: '#/components/parameters/SortOrderQuery' },
          { $ref: '#/components/parameters/SearchQuery' },
        ],
        responses: {
          200: {
            description: 'Список stories успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StoriesListResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Stories'],
        summary: 'Створити story',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/StoryCreateRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Story успішно створено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Story',
                },
              },
            },
          },
          400: {
            description: 'Некоректні дані або category не знайдена',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/stories/created': {
      get: {
        tags: ['Stories'],
        summary: 'Отримати stories, створені поточним користувачем',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PerPageStoriesParam' },
        ],
        responses: {
          200: {
            description: 'Власні stories успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StoriesListResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/stories/saved': {
      get: {
        tags: ['Stories'],
        summary: 'Отримати збережені stories поточного користувача',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PerPageStoriesParam' },
        ],
        responses: {
          200: {
            description: 'Збережені stories успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StoriesListResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/stories/{storyId}': {
      get: {
        tags: ['Stories'],
        summary: 'Отримати story за ID',
        parameters: [{ $ref: '#/components/parameters/StoryIdParam' }],
        responses: {
          200: {
            description: 'Story знайдено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Story',
                },
              },
            },
          },
          404: {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/stories/{storyId}/save': {
      post: {
        tags: ['Stories'],
        summary: 'Зберегти story',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/StoryIdParam' }],
        responses: {
          200: {
            description: 'Story успішно збережено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Story або user не знайдено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Stories'],
        summary: 'Видалити story із saved',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/StoryIdParam' }],
        responses: {
          200: {
            description: 'Story успішно видалено із saved',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Story або user не знайдено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Отримати список користувачів',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PerPageUsersParam' },
        ],
        responses: {
          200: {
            description: 'Список користувачів успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UsersListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Отримати поточного користувача',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Поточного користувача успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Оновити профіль поточного користувача',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserUpdateRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Дані користувача успішно оновлено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          409: {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/me/avatar': {
      patch: {
        tags: ['Users'],
        summary: 'Оновити аватар поточного користувача',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  avatar: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['avatar'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Аватар успішно оновлено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AvatarUploadResponse',
                },
              },
            },
          },
          400: {
            description: 'No file',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Неавторизовано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/verify/{token}': {
      get: {
        tags: ['Users'],
        summary: 'Підтвердити email користувача',
        parameters: [{ $ref: '#/components/parameters/VerifyTokenParam' }],
        responses: {
          200: {
            description: 'Email успішно підтверджено',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },
          404: {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Отримати публічний профіль користувача',
        parameters: [
          { $ref: '#/components/parameters/UserIdParam' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PerPageStoriesParam' },
        ],
        responses: {
          200: {
            description: 'Профіль користувача успішно отримано',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserProfileResponse',
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Nature Travels API Docs',
    }),
  );
};

export default swaggerSpec;
