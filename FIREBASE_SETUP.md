# 🔥 Firebase Integration - Fed Catálogo Arquitetura

## ✅ Configuração Completa

O Firebase foi integrado com sucesso ao projeto Angular 20!

## 📁 Estrutura Criada

```
src/
├── environments/
│   ├── environment.ts           # Configuração de desenvolvimento
│   └── environment.prod.ts      # Configuração de produção
└── app/
    └── shared/
        └── services/
            └── firebase/
                ├── firebase-auth.service.ts       # Autenticação
                ├── firebase-firestore.service.ts  # Banco de dados
                └── firebase-storage.service.ts    # Armazenamento
```

## 🔑 Credenciais Configuradas

```typescript
{
  apiKey: "AIzaSyAOQ2p4Gwnd_7sZydjKTDpnxQFyO2SefCY",
  authDomain: "fed-catalogo-arquitetura.firebaseapp.com",
  projectId: "fed-catalogo-arquitetura",
  storageBucket: "fed-catalogo-arquitetura.firebasestorage.app",
  messagingSenderId: "561253150491",
  appId: "1:561253150491:web:1c0a1ed771cf5900c6adbe",
  measurementId: "G-D14BB7814F"
}
```

## 🚀 Serviços Disponíveis

### 1. FirebaseAuthService

Serviço para gerenciar autenticação de usuários.

**Uso:**
```typescript
import { FirebaseAuthService } from './shared/services/firebase/firebase-auth.service';

export class MyComponent {
  private authService = inject(FirebaseAuthService);

  async login() {
    try {
      const result = await this.authService.signInWithEmail('email@example.com', 'password');
      console.log('Usuário logado:', result.user);
    } catch (error) {
      console.error('Erro no login:', error);
    }
  }

  async loginWithGoogle() {
    const result = await this.authService.signInWithGoogle();
  }

  logout() {
    await this.authService.signOut();
  }

  // Observable do usuário atual
  ngOnInit() {
    this.authService.user$.subscribe(user => {
      console.log('Usuário atual:', user);
    });
  }
}
```

**Métodos Disponíveis:**
- `signInWithEmail(email, password)` - Login com email/senha
- `signUpWithEmail(email, password)` - Criar conta
- `signInWithGoogle()` - Login com Google
- `signOut()` - Logout
- `getCurrentUser()` - Obter usuário atual
- `isAuthenticated()` - Verificar se está autenticado
- `user$` - Observable do estado de autenticação

### 2. FirebaseFirestoreService

Serviço para operações no banco de dados Firestore.

**Uso:**
```typescript
import { FirebaseFirestoreService } from './shared/services/firebase/firebase-firestore.service';

export class PropertyComponent {
  private firestoreService = inject(FirebaseFirestoreService);

  // Buscar coleção
  getProperties() {
    this.firestoreService
      .getCollection('properties')
      .subscribe(properties => {
        console.log('Propriedades:', properties);
      });
  }

  // Buscar com filtros
  getFeaturedProperties() {
    this.firestoreService
      .getCollection(
        'properties',
        this.firestoreService.where('featured', '==', true),
        this.firestoreService.orderBy('createdAt', 'desc'),
        this.firestoreService.limit(10)
      )
      .subscribe(properties => {
        console.log('Propriedades em destaque:', properties);
      });
  }

  // Buscar documento específico
  getProperty(id: string) {
    this.firestoreService
      .getDocument('properties', id)
      .subscribe(property => {
        console.log('Propriedade:', property);
      });
  }

  // Adicionar documento
  async addProperty(propertyData: any) {
    const docRef = await this.firestoreService.addDocument('properties', propertyData);
    console.log('Propriedade adicionada com ID:', docRef.id);
  }

  // Atualizar documento
  async updateProperty(id: string, data: any) {
    await this.firestoreService.updateDocument('properties', id, data);
  }

  // Deletar documento
  async deleteProperty(id: string) {
    await this.firestoreService.deleteDocument('properties', id);
  }
}
```

**Métodos Disponíveis:**
- `getCollection<T>(collectionName, ...queryConstraints)` - Buscar coleção com filtros
- `getDocument<T>(collectionName, docId)` - Buscar documento
- `addDocument(collectionName, data)` - Adicionar documento
- `setDocument(collectionName, docId, data, merge?)` - Criar/sobrescrever documento
- `updateDocument(collectionName, docId, data)` - Atualizar documento
- `deleteDocument(collectionName, docId)` - Deletar documento
- `where()`, `orderBy()`, `limit()` - Helpers para queries

### 3. FirebaseStorageService

Serviço para upload e gerenciamento de arquivos.

**Uso:**
```typescript
import { FirebaseStorageService } from './shared/services/firebase/firebase-storage.service';

export class UploadComponent {
  private storageService = inject(FirebaseStorageService);

  // Upload simples
  async uploadImage(file: File) {
    try {
      const path = `properties/${Date.now()}_${file.name}`;
      await this.storageService.uploadFile(path, file);

      // Obter URL de download
      this.storageService.getDownloadURL(path).subscribe(url => {
        console.log('URL da imagem:', url);
      });
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  }

  // Upload com progresso
  uploadWithProgress(file: File) {
    const path = `properties/${Date.now()}_${file.name}`;
    const uploadTask = this.storageService.uploadFileResumable(path, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Progresso:', progress + '%');
      },
      (error) => {
        console.error('Erro:', error);
      },
      () => {
        console.log('Upload completo!');
      }
    );
  }

  // Deletar arquivo
  async deleteImage(path: string) {
    await this.storageService.deleteFile(path);
  }

  // Listar arquivos em uma pasta
  async listImages() {
    const files = await this.storageService.listFiles('properties/');
    console.log('Arquivos:', files);
  }
}
```

**Métodos Disponíveis:**
- `uploadFile(path, file)` - Upload simples
- `uploadFileResumable(path, file)` - Upload com progresso
- `getDownloadURL(path)` - Obter URL pública
- `deleteFile(path)` - Deletar arquivo
- `listFiles(path)` - Listar arquivos
- `getStorageRef(path)` - Obter referência do storage

## 🎯 Funcionalidades Configuradas

- ✅ **Authentication** - Login com Email/Senha e Google
- ✅ **Firestore Database** - Banco de dados NoSQL em tempo real
- ✅ **Storage** - Armazenamento de arquivos (imagens, documentos)
- ✅ **Analytics** - Google Analytics integrado

## 🔧 Configuração nos Ambientes

Os arquivos de ambiente substituem automaticamente em produção:

- **Desenvolvimento**: `npm start` usa `environment.ts`
- **Produção**: `npm run build` usa `environment.prod.ts`

## 📝 Próximos Passos Sugeridos

### 1. Configurar Regras de Segurança no Firebase Console

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública de propriedades
    match /properties/{property} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Wishlist e Compare apenas para usuários autenticados
    match /wishlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Migrar Dados Estáticos para Firestore

Converter arquivos JSON em `public/assets/data/` para coleções Firestore:

- `latest-for-rent.json` → Coleção `properties`
- `agents.json` → Coleção `agents`
- `blog.json` → Coleção `posts`

### 3. Integrar com NGXS State Management

Atualizar actions do NGXS para usar Firebase:

```typescript
@Action(LoadProperties)
loadProperties(ctx: StateContext<PropertyStateModel>) {
  return this.firestoreService.getCollection('properties').pipe(
    tap(properties => {
      ctx.patchState({ properties });
    })
  );
}
```

### 4. Adicionar Guards de Autenticação

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  if (authService.isAuthenticated()) {
    return true;
  }
  return inject(Router).parseUrl('/login');
};
```

## 🛠 Comandos Úteis

```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Build de desenvolvimento
npm run build -- --configuration=development
```

## 📚 Recursos Adicionais

- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Query Guide](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## ⚠️ Notas Importantes

1. **Segurança**: As credenciais estão no código para desenvolvimento. Para produção, considere usar variáveis de ambiente.
2. **Regras**: Configure regras de segurança no Firebase Console antes de usar em produção.
3. **Billing**: Firebase tem plano gratuito (Spark), mas monitore o uso para evitar cobranças.
4. **Analytics**: O Google Analytics está configurado mas requer consentimento LGPD/GDPR.

## 🎉 Conclusão

Firebase integrado e pronto para uso! Todos os serviços estão disponíveis e documentados.

Build de produção: **1.66 MB** (304.32 kB comprimido)
