interface BaseContent {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    status: 'draft' | 'published' | 'archived';
}
  
interface Article extends BaseContent {
    title: string;
    content: string;
    author: string;
    tags?: string[];
}
  
interface Product extends BaseContent {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}
  
type ContentOperations<T extends BaseContent> = {
    create: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => T;
    read: (id: string) => T | null;
    update: (id: string, updates: Partial<T>) => T | null;
    delete: (id: string) => boolean;
};

type Role = 'admin' | 'editor' | 'viewer';

type Permission = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

type AccessControl<T extends BaseContent> = {
  role: Role;
  permissions: {
    [K in keyof T]?: Permission;
  };
};

type Validator<T> = {
    validate: (data: T) => ValidationResult;
  };
  
  type ValidationResult = {
    isValid: boolean;
    errors?: string[];
  };
  
  const articleValidator: Validator<Article> = {
    validate: (data) => {
      const errors: string[] = [];
      if (!data.title) errors.push('Title is required.');
      if (!data.content) errors.push('Content is required.');
      if (data.title && data.title.length < 5) errors.push('Title must be at least 5 characters long.');
      return { isValid: errors.length === 0, errors };
    },
  };
  
  const productValidator: Validator<Product> = {
    validate: (data) => {
      const errors: string[] = [];
      if (!data.name) errors.push('Name is required.');
      if (data.price < 0) errors.push('Price must be non-negative.');
      if (data.stock < 0) errors.push('Stock must be non-negative.');
      return { isValid: errors.length === 0, errors };
    },
};
  
type Versioned<T extends BaseContent> = T & {
    version: number;
    previousVersions?: Versioned<T>[];
};



// Демонстрація роботи програми
const articleOperations: ContentOperations<Article> = {
    create: (item) => {
      const newArticle: Article = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
      };
      console.log('Article created:', newArticle);
      return newArticle;
    },
    read: (id) => {
      console.log(`Fetching article with ID: ${id}`);
      return null;
    },
    update: (id, updates) => {
      console.log(`Updating article with ID: ${id}`);
      const updatedArticle: Article = {
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        title: updates.title || 'Updated Title',
        content: updates.content || 'Updated Content',
        author: updates.author || 'Updated Author',
      };
      return updatedArticle;
    },
    delete: (id) => {
      console.log(`Deleting article with ID: ${id}`);
      return true;
    },
};

const testArticle: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Article',
    content: 'This is the content of the article.',
    author: 'Alex',
    status: 'draft',
};

const validateArticle = (article: Article) => {
    const validation = articleValidator.validate(article);
    if (validation.isValid) {
      console.log('Article is valid:', article);
    } else {
      console.error('Validation errors:', validation.errors);
    }
  };

  const createdArticle = articleOperations.create(testArticle);
  validateArticle(createdArticle);

  const updatedArticle = articleOperations.update(createdArticle.id, {
    title: 'Updated Article Title',
  });
  console.log('Updated Article:', updatedArticle);

  const accessControl: AccessControl<Article> = {
    role: 'editor',
    permissions: {
      title: { create: true, read: true, update: true, delete: false },
      content: { create: true, read: true, update: true, delete: false },
    },
  };
  
  const canUpdateTitle = accessControl.permissions.title?.update;
  console.log(`Editor can update title: ${canUpdateTitle}`);

  const versionedArticle: Versioned<Article> = {
    ...createdArticle,
    version: 1,
  };
  
  const newVersion: Versioned<Article> = {
    ...versionedArticle,
    version: 2,
    updatedAt: new Date(),
    title: 'New Version Title',
    previousVersions: [versionedArticle],
  };
  
console.log('Versioned Article:', newVersion);
