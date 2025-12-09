# 🗄️ Firebase Realtime Database - Integração de Dados do Usuário

## ✅ Implementação Completa

A aplicação agora salva automaticamente os dados do usuário no Firebase Realtime Database no primeiro login, criando um perfil completo com informações de nome, email, telefone (quando disponível) e timestamps.

## 📝 Mudanças Implementadas

### 1. **Configuração do Firebase Realtime Database**

#### App Config ([app.config.ts](src/app/app.config.ts)):

```typescript
import { getDatabase, provideDatabase } from "@angular/fire/database";

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideDatabase(() => getDatabase()),
    // ...
  ]
};
```

**Funcionalidade:**
- Inicializa o Firebase Realtime Database
- Disponibiliza o serviço para toda a aplicação
- Usa a configuração do `environment.ts`

---

### 2. **Serviço de Gerenciamento de Usuários**

#### Novo arquivo: [firebase-database.service.ts](src/app/shared/services/firebase/firebase-database.service.ts)

##### Interface UserData:

```typescript
export interface UserData {
  name: string;        // Nome do usuário
  email: string;       // Email do usuário
  phone: string;       // Telefone (vazio se não disponível)
  photoURL?: string;   // URL da foto de perfil (opcional)
  createdAt: number;   // Timestamp de criação (primeira vez)
  lastLogin: number;   // Timestamp do último login
}
```

##### Métodos Implementados:

**1. checkUserExists(uid: string): Promise<boolean>**
```typescript
// Verifica se usuário já existe no database
const userExists = await this.databaseService.checkUserExists(user.uid);
```

**Comportamento:**
- Busca registro em `users/{uid}`
- Retorna `true` se usuário existe
- Retorna `false` se for primeiro login
- Não lança erros (retorna `false` em caso de erro)

**2. createUser(uid: string, userData: UserData): Promise<void>**
```typescript
// Cria novo usuário no database
await this.databaseService.createUser(user.uid, {
  name: "João Silva",
  email: "joao@email.com",
  phone: "",
  photoURL: "https://...",
  createdAt: Date.now(),
  lastLogin: Date.now()
});
```

**Comportamento:**
- Cria registro em `users/{uid}`
- Sobrescreve dados se já existir (usar com cuidado!)
- Loga sucesso no console
- Lança erro se falhar

**3. updateUser(uid: string, userData: Partial<UserData>): Promise<void>**
```typescript
// Atualiza dados específicos do usuário
await this.databaseService.updateUser(user.uid, {
  phone: "+55 11 99999-9999",
  lastLogin: Date.now()
});
```

**Comportamento:**
- Atualiza apenas campos especificados
- Mantém campos não especificados
- Usa Firebase `update()` (não sobrescreve tudo)
- Loga sucesso no console

**4. getUser(uid: string): Observable<UserData | null>**
```typescript
// Observa dados do usuário em tempo real
this.databaseService.getUser(user.uid).subscribe((userData) => {
  if (userData) {
    console.log("Nome:", userData.name);
    console.log("Email:", userData.email);
  }
});
```

**Comportamento:**
- Retorna Observable que emite atualizações em tempo real
- Emite `null` se usuário não existir
- Atualiza automaticamente quando dados mudam
- Cleanup automático ao unsubscribe

**5. getUserOnce(uid: string): Promise<UserData | null>**
```typescript
// Busca dados do usuário uma única vez (sem observar mudanças)
const userData = await this.databaseService.getUserOnce(user.uid);
if (userData) {
  console.log("Nome:", userData.name);
}
```

**Comportamento:**
- Busca dados uma vez (não observa mudanças)
- Retorna `null` se usuário não existir
- Mais eficiente que Observable para leitura única
- Útil para verificações pontuais

**6. updateLastLogin(uid: string): Promise<void>**
```typescript
// Atualiza timestamp do último login
await this.databaseService.updateLastLogin(user.uid);
```

**Comportamento:**
- Atualiza apenas campo `lastLogin`
- Usa `Date.now()` automaticamente
- Lança erro se falhar

---

### 3. **Integração com Login Form**

#### Modificações em [login-form.ts](src/app/components/pages/other-pages/widgets/login-form/login-form.ts):

##### Imports Adicionados:

```typescript
import { User } from "@angular/fire/auth";
import {
  FirebaseDatabaseService,
  UserData,
} from "../../../../../shared/services/firebase/firebase-database.service";
```

##### Service Injection:

```typescript
export class LoginForm {
  private authService = inject(FirebaseAuthService);
  private databaseService = inject(FirebaseDatabaseService); // NOVO
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  // ...
}
```

##### Login com Email/Senha (onSubmit):

```typescript
async onSubmit() {
  // ... validação do form ...

  try {
    // 1. Autentica com Firebase Auth
    const result = await this.authService.signInWithEmail(email, password);

    // 2. Salva dados no Realtime Database se for primeiro login
    await this.saveUserDataIfFirstLogin(result.user);

    // 3. Feedback e navegação
    this.toastr.success(`Bem-vindo, ${result.user.email}!`, "Login realizado");
    this.router.navigate(["/"]);
  } catch (error: any) {
    this.handleAuthError(error);
  }
}
```

##### Login com Google (loginWithGoogle):

```typescript
async loginWithGoogle() {
  this.isLoading = true;

  try {
    // 1. Autentica com Google
    const result = await this.authService.signInWithGoogle();

    // 2. Salva dados no Realtime Database se for primeiro login
    await this.saveUserDataIfFirstLogin(result.user);

    // 3. Feedback e navegação
    this.toastr.success(`Bem-vindo, ${result.user.displayName}!`, "Login com Google");
    this.router.navigate(["/"]);
  } catch (error: any) {
    this.handleAuthError(error);
  }
}
```

##### Método Principal: saveUserDataIfFirstLogin

```typescript
private async saveUserDataIfFirstLogin(user: User): Promise<void> {
  try {
    // 1. Verifica se usuário já existe
    const userExists = await this.databaseService.checkUserExists(user.uid);

    if (!userExists) {
      // PRIMEIRO LOGIN - Cria registro completo
      const userData: UserData = {
        name: user.displayName || user.email?.split("@")[0] || "Usuário",
        email: user.email || "",
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };

      await this.databaseService.createUser(user.uid, userData);
      console.log("User data saved to Realtime Database:", user.uid);
    } else {
      // JÁ EXISTE - Apenas atualiza último login
      await this.databaseService.updateLastLogin(user.uid);
      console.log("Last login updated for user:", user.uid);
    }
  } catch (error) {
    console.error("Error saving user data to database:", error);
    // Não lança erro - permite login mesmo se salvar falhar
  }
}
```

**Comportamento:**
- Executa após autenticação bem-sucedida
- Verifica se é primeiro login
- Salva dados completos se for primeiro login
- Atualiza apenas `lastLogin` se já existir
- Não bloqueia login se database falhar
- Loga todas as operações no console

---

## 🎯 Estrutura de Dados no Firebase

### Database Path:
```
/users
  /{uid}
    name: "João Silva"
    email: "joao@email.com"
    phone: "+55 11 99999-9999"
    photoURL: "https://lh3.googleusercontent.com/..."
    createdAt: 1730750400000
    lastLogin: 1730836800000
```

### Exemplo Real:

**Login com Email/Senha:**
```json
{
  "users": {
    "hX8kP3mQ2fV5nR9tY1aB": {
      "name": "teste",
      "email": "teste@email.com",
      "phone": "",
      "photoURL": "",
      "createdAt": 1730750400000,
      "lastLogin": 1730750400000
    }
  }
}
```

**Login com Google:**
```json
{
  "users": {
    "gL4jK8pN6wX3vT2yQ9mZ": {
      "name": "Maria Santos",
      "email": "maria.santos@gmail.com",
      "phone": "",
      "photoURL": "https://lh3.googleusercontent.com/a/AEdFTp5...",
      "createdAt": 1730750500000,
      "lastLogin": 1730836900000
    }
  }
}
```

---

## 🔄 Fluxo Completo de Login

```mermaid
graph TD
    A[Usuário faz login] --> B{Método de autenticação}
    B -->|Email/Senha| C[signInWithEmail]
    B -->|Google| D[signInWithGoogle]

    C --> E[Firebase Auth - Sucesso]
    D --> E

    E --> F[saveUserDataIfFirstLogin]
    F --> G{Usuário existe no DB?}

    G -->|NÃO| H[checkUserExists = false]
    G -->|SIM| I[checkUserExists = true]

    H --> J[createUser - Salvar dados completos]
    I --> K[updateLastLogin - Atualizar timestamp]

    J --> L{Salvou com sucesso?}
    K --> L

    L -->|SIM| M[Log: Dados salvos]
    L -->|NÃO| N[Log: Erro - mas continua]

    M --> O[Toastr: Bem-vindo]
    N --> O

    O --> P[Navegar para /]
    P --> Q[Header mostra perfil do usuário]
```

---

## 📊 Casos de Uso

### Caso 1: Primeiro Login com Email/Senha

**Ação do Usuário:**
1. Acessa `/page/other-pages/log-in`
2. Preenche email: `joao@email.com`
3. Preenche senha: `senha123`
4. Clica em "Entrar"

**Fluxo do Sistema:**
1. ✅ Validação do formulário passa
2. ✅ Firebase Auth autentica usuário
3. ✅ `checkUserExists("uid123")` retorna `false`
4. ✅ `createUser()` salva:
   ```typescript
   {
     name: "joao",          // Extraído de "joao@email.com"
     email: "joao@email.com",
     phone: "",             // Vazio (não disponível)
     photoURL: "",          // Vazio (não tem foto)
     createdAt: 1730750400000,
     lastLogin: 1730750400000
   }
   ```
5. ✅ Toastr: "Bem-vindo, joao@email.com!"
6. ✅ Navega para `/`
7. ✅ Header mostra avatar com iniciais "JO"

**Resultado no Database:**
```
/users/uid123
```

---

### Caso 2: Primeiro Login com Google

**Ação do Usuário:**
1. Acessa `/page/other-pages/log-in`
2. Clica em "Login with Google"
3. Popup do Google abre
4. Seleciona conta Google
5. Autoriza aplicação

**Fluxo do Sistema:**
1. ✅ Firebase Auth retorna UserCredential do Google
2. ✅ `checkUserExists("goog456")` retorna `false`
3. ✅ `createUser()` salva:
   ```typescript
   {
     name: "Maria Santos",  // Do perfil do Google
     email: "maria@gmail.com",
     phone: "",             // Google não fornece por padrão
     photoURL: "https://lh3.googleusercontent.com/...",
     createdAt: 1730750500000,
     lastLogin: 1730750500000
   }
   ```
4. ✅ Toastr: "Bem-vindo, Maria Santos!"
5. ✅ Navega para `/`
6. ✅ Header mostra foto do Google no avatar

**Resultado no Database:**
```
/users/goog456
```

---

### Caso 3: Login Subsequente (Usuário já existe)

**Ação do Usuário:**
1. Usuário que já fez login antes acessa novamente
2. Faz login (qualquer método)

**Fluxo do Sistema:**
1. ✅ Firebase Auth autentica
2. ✅ `checkUserExists("uid123")` retorna `true`
3. ✅ `updateLastLogin()` atualiza apenas:
   ```typescript
   {
     lastLogin: 1730836800000  // Novo timestamp
     // Outros campos permanecem inalterados
   }
   ```
4. ✅ Toastr: "Bem-vindo, joao@email.com!"
5. ✅ Navega para `/`

**Resultado no Database:**
```
/users/uid123
  lastLogin: 1730836800000  (ATUALIZADO)
  (outros campos mantidos)
```

---

### Caso 4: Erro ao Salvar no Database

**Cenário:**
- Rede instável
- Firebase Database offline
- Permissões incorretas

**Fluxo do Sistema:**
1. ✅ Firebase Auth autentica normalmente
2. ❌ `createUser()` falha
3. ✅ Erro é logado no console
4. ✅ **Login CONTINUA** (não bloqueia)
5. ✅ Toastr: "Bem-vindo, joao@email.com!"
6. ✅ Navega para `/`

**Comportamento:**
```typescript
catch (error) {
  console.error("Error saving user data to database:", error);
  // Não lança erro - permite login continuar
}
```

**Importante:** O usuário consegue usar a aplicação normalmente, mesmo que o database falhe.

---

## 🔐 Segurança e Regras do Firebase

### Regras Sugeridas para Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        // Usuário pode ler apenas seus próprios dados
        ".read": "$uid === auth.uid",

        // Usuário pode criar seu próprio registro no primeiro login
        ".write": "$uid === auth.uid && (!data.exists() || data.exists())",

        // Validação dos campos
        ".validate": "newData.hasChildren(['name', 'email', 'createdAt', 'lastLogin'])",

        "name": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "email": {
          ".validate": "newData.isString() && newData.val().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i)"
        },
        "phone": {
          ".validate": "newData.isString()"
        },
        "photoURL": {
          ".validate": "newData.isString()"
        },
        "createdAt": {
          ".validate": "newData.isNumber() && (!data.exists() || data.val() === newData.val())"
        },
        "lastLogin": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
```

**Regras Explicadas:**

1. **Read**: Usuário só pode ler seus próprios dados
2. **Write**: Usuário só pode escrever seus próprios dados
3. **Validação**: Garante que campos obrigatórios existem
4. **createdAt**: Não pode ser alterado após criação
5. **Email**: Valida formato de email

### Aplicar no Firebase Console:

1. Acesse: [Firebase Console](https://console.firebase.google.com/)
2. Selecione projeto: `fed-catalogo-arquitetura`
3. Vá em **Realtime Database** → **Regras**
4. Cole as regras acima
5. Clique em **Publicar**

---

## 🧪 Testando a Integração

### 1. Preparação

```bash
# Inicie o servidor de desenvolvimento
npm start
```

Acesse: `http://localhost:4200`

---

### 2. Teste: Primeiro Login com Email/Senha

**Passos:**
1. Vá para `/page/other-pages/log-in`
2. Preencha:
   - Email: `teste@email.com`
   - Senha: `senha123`
3. Clique em "Entrar"

**Verificar:**
- ✅ Toastr aparece: "Bem-vindo, teste@email.com!"
- ✅ Redireciona para `/`
- ✅ Header mostra avatar com iniciais "TE"
- ✅ Console log: "User data saved to Realtime Database: {uid}"

**Verificar no Firebase Console:**
1. Acesse: Firebase Console → Realtime Database
2. Procure: `/users/{uid}`
3. Veja dados salvos:
   ```json
   {
     "name": "teste",
     "email": "teste@email.com",
     "phone": "",
     "photoURL": "",
     "createdAt": 1730750400000,
     "lastLogin": 1730750400000
   }
   ```

---

### 3. Teste: Primeiro Login com Google

**Passos:**
1. Logout (clique no avatar → Sair)
2. Vá para `/page/other-pages/log-in`
3. Clique em "Login with Google"
4. Selecione conta Google
5. Autorize aplicação

**Verificar:**
- ✅ Toastr: "Bem-vindo, {Seu Nome}!"
- ✅ Redireciona para `/`
- ✅ Header mostra foto do Google
- ✅ Console log: "User data saved to Realtime Database: {uid}"

**Verificar no Firebase Console:**
1. Novo usuário criado em `/users/{uid_google}`
2. Dados incluem:
   - `name`: Nome do perfil Google
   - `email`: Email do Google
   - `photoURL`: URL da foto do Google
   - `phone`: "" (vazio)

---

### 4. Teste: Login Subsequente

**Passos:**
1. Faça logout
2. Faça login novamente com mesma conta

**Verificar:**
- ✅ Login funciona normalmente
- ✅ Console log: "Last login updated for user: {uid}"
- ✅ No Firebase, apenas `lastLogin` foi atualizado
- ✅ Outros campos permanecem inalterados

---

### 5. Teste: Observar Dados em Tempo Real

**Código de Teste (em algum componente):**
```typescript
ngOnInit() {
  const uid = this.authService.getCurrentUser()?.uid;
  if (uid) {
    this.databaseService.getUser(uid).subscribe((userData) => {
      console.log("User Data (realtime):", userData);
    });
  }
}
```

**Verificar:**
1. Abra console do navegador
2. Veja dados do usuário sendo logados
3. No Firebase Console, altere algum campo manualmente
4. Observe atualização automática no console do navegador

---

## 📱 Dados Salvos por Método de Login

### Email/Senha:

| Campo | Valor | Origem |
|-------|-------|--------|
| `name` | Email antes do @ | `user.email.split("@")[0]` |
| `email` | Email fornecido | `user.email` |
| `phone` | "" (vazio) | Não disponível |
| `photoURL` | "" (vazio) | Não tem foto |
| `createdAt` | Timestamp | `Date.now()` |
| `lastLogin` | Timestamp | `Date.now()` |

**Exemplo:**
```json
{
  "name": "joao.silva",
  "email": "joao.silva@email.com",
  "phone": "",
  "photoURL": "",
  "createdAt": 1730750400000,
  "lastLogin": 1730750400000
}
```

---

### Google:

| Campo | Valor | Origem |
|-------|-------|--------|
| `name` | Nome do perfil | `user.displayName` |
| `email` | Email do Google | `user.email` |
| `phone` | "" (vazio) | `user.phoneNumber` (geralmente vazio) |
| `photoURL` | URL da foto | `user.photoURL` |
| `createdAt` | Timestamp | `Date.now()` |
| `lastLogin` | Timestamp | `Date.now()` |

**Exemplo:**
```json
{
  "name": "Maria Santos",
  "email": "maria.santos@gmail.com",
  "phone": "",
  "photoURL": "https://lh3.googleusercontent.com/a/AEdFTp5abc123...",
  "createdAt": 1730750500000,
  "lastLogin": 1730750500000
}
```

---

## 🎯 Funcionalidades Futuras Sugeridas

### 1. Edição de Perfil

Permitir usuário atualizar seus dados:

```typescript
// Componente de perfil
async updateProfile(name: string, phone: string) {
  const uid = this.authService.getCurrentUser()?.uid;
  if (uid) {
    await this.databaseService.updateUser(uid, {
      name: name,
      phone: phone,
      lastLogin: Date.now()
    });
    this.toastr.success("Perfil atualizado!", "Sucesso");
  }
}
```

---

### 2. Upload de Foto de Perfil

Integrar com Firebase Storage:

```typescript
async uploadProfilePhoto(file: File) {
  const uid = this.authService.getCurrentUser()?.uid;
  if (uid) {
    // 1. Upload para Storage
    const downloadURL = await this.storageService.uploadFile(
      `users/${uid}/profile.jpg`,
      file
    );

    // 2. Atualizar URL no Database
    await this.databaseService.updateUser(uid, {
      photoURL: downloadURL
    });

    this.toastr.success("Foto atualizada!", "Sucesso");
  }
}
```

---

### 3. Verificação de Telefone

Adicionar validação de número de telefone:

```typescript
async verifyPhone(phoneNumber: string) {
  const uid = this.authService.getCurrentUser()?.uid;
  if (uid) {
    // Validar formato
    if (this.isValidPhone(phoneNumber)) {
      await this.databaseService.updateUser(uid, {
        phone: phoneNumber,
        phoneVerified: true
      });
    }
  }
}
```

---

### 4. Estatísticas de Usuário

Rastrear atividades do usuário:

```typescript
interface UserData {
  // Campos existentes...

  // Novos campos:
  loginCount: number;        // Contador de logins
  lastActivity: number;      // Última atividade
  favoriteProperties: string[];  // IDs de propriedades favoritas
  searchHistory: string[];   // Histórico de buscas
}
```

---

### 5. Dados Adicionais do Google

Solicitar mais permissões do Google:

```typescript
// No FirebaseAuthService
async signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  // Solicitar acesso ao telefone
  provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');

  const result = await signInWithPopup(this.auth, provider);
  return result;
}
```

---

## 🐛 Troubleshooting

### Problema: Dados não são salvos

**Possíveis Causas:**
1. Regras do Database bloqueando escrita
2. Rede instável
3. Configuração incorreta do Firebase

**Solução:**
```typescript
// Verificar no console
console.log("Firebase Database initialized:", this.database);
console.log("User UID:", user.uid);
console.log("User exists check:", await this.checkUserExists(user.uid));
```

---

### Problema: "Permission denied"

**Causa:** Regras do Firebase bloqueando acesso

**Solução Temporária (apenas desenvolvimento):**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Lembrete:** Use regras específicas em produção!

---

### Problema: lastLogin não atualiza

**Causa:** Método `updateLastLogin()` falhando silenciosamente

**Solução:**
```typescript
try {
  await this.databaseService.updateLastLogin(user.uid);
  console.log("✅ Last login updated successfully");
} catch (error) {
  console.error("❌ Failed to update last login:", error);
}
```

---

## 📊 Resumo da Implementação

### Arquivos Criados:
- ✅ [firebase-database.service.ts](src/app/shared/services/firebase/firebase-database.service.ts) (134 linhas)

### Arquivos Modificados:
- ✅ [app.config.ts](src/app/app.config.ts) - Adicionado Realtime Database provider
- ✅ [login-form.ts](src/app/components/pages/other-pages/widgets/login-form/login-form.ts) - Integrado salvamento de dados

### Build Status:
```
✅ Build bem-sucedido
📦 Bundle: 1.86 MB inicial (347.86 KB comprimido)
⚠️ Apenas warnings CommonJS (normal)
```

### Funcionalidades:
- ✅ Detecção automática de primeiro login
- ✅ Salvamento de dados completos (nome, email, telefone, foto)
- ✅ Atualização de último login em logins subsequentes
- ✅ Suporte para login com Email/Senha
- ✅ Suporte para login com Google
- ✅ Observable para dados em tempo real
- ✅ Error handling robusto
- ✅ Não bloqueia login se database falhar

---

## 🎉 Conclusão

A integração do Firebase Realtime Database está completa e funcional! Agora todos os usuários que fizerem login terão seus dados salvos automaticamente, permitindo:

- ✅ Perfil de usuário persistente
- ✅ Rastreamento de atividades
- ✅ Histórico de logins
- ✅ Base para funcionalidades futuras (favoritos, mensagens, notificações)
- ✅ Experiência personalizada por usuário

O sistema está pronto para ser expandido com novas funcionalidades de gerenciamento de usuários!
