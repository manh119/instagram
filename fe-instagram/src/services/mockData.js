// Minimal in-memory mock data and helpers to run the app without Firebase
import { v4 as uuidv4 } from "uuid";

const now = Date.now();

export const mockUsers = [
    {
        uid: "u_alice",
        email: "alice@example.com",
        username: "alice",
        fullName: "Alice Johnson",
        bio: "Just Alice",
        profilePicURL: "/profilepic.png",
        followers: ["u_bob"],
        following: ["u_bob"],
        posts: [],
        createdAt: now - 100000,
    },
    {
        uid: "u_bob",
        email: "bob@example.com",
        username: "bob",
        fullName: "Bob Lee",
        bio: "Builder",
        profilePicURL: "/profilepic.png",
        followers: ["u_alice"],
        following: ["u_alice"],
        posts: [],
        createdAt: now - 90000,
    },
    {
        uid: "u_chris",
        email: "chris@example.com",
        username: "chris",
        fullName: "Chris Kim",
        bio: "Photographer",
        profilePicURL: "/profilepic.png",
        followers: [],
        following: [],
        posts: [],
        createdAt: now - 80000,
    },
];

export const mockPosts = [
    {
        id: uuidv4(),
        caption: "Sunset vibes",
        likes: [],
        comments: [],
        createdAt: now - 50000,
        createdBy: "u_bob",
        imageURL: "/img1.png",
    },
    {
        id: uuidv4(),
        caption: "Coffee time",
        likes: [],
        comments: [],
        createdAt: now - 40000,
        createdBy: "u_alice",
        imageURL: "/img2.png",
    },
];

// Link posts to users
for (const post of mockPosts) {
    const owner = mockUsers.find((u) => u.uid === post.createdBy);
    if (owner) {
        owner.posts.push(post.id);
    }
}

export const mockSession = {
    // default to alice logged in
    currentUserUid: "u_alice",
};

export function getCurrentUser() {
    const user = mockUsers.find((u) => u.uid === mockSession.currentUserUid);
    return user ? { ...user } : null;
}

export function signInWithEmailAndPasswordMock(email, _password) {
    const user = mockUsers.find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");
    mockSession.currentUserUid = user.uid;
    return { user: { uid: user.uid } };
}

export function signOutMock() {
    mockSession.currentUserUid = null;
}

export function createUserMock({ email, password, username, fullName }) {
    if (!email || !password || !username || !fullName) throw new Error("Missing fields");
    if (mockUsers.some((u) => u.username === username)) throw new Error("Username already exists");
    const uid = `u_${uuidv4().slice(0, 8)}`;
    const user = {
        uid,
        email,
        username,
        fullName,
        bio: "",
        profilePicURL: "",
        followers: [],
        following: [],
        posts: [],
        createdAt: Date.now(),
    };
    mockUsers.push(user);
    mockSession.currentUserUid = uid;
    return { user: { uid } };
}

export function findUserByUid(uid) {
    return mockUsers.find((u) => u.uid === uid) || null;
}

export function findUserByUsername(username) {
    return mockUsers.find((u) => u.username === username) || null;
}

export function listUsersExclude(uids, limitCount = 3) {
    const set = new Set(uids);
    return mockUsers.filter((u) => !set.has(u.uid)).slice(0, limitCount);
}

export function listPostsByCreators(creatorUids) {
    const set = new Set(creatorUids);
    return mockPosts
        .filter((p) => set.has(p.createdBy))
        .sort((a, b) => b.createdAt - a.createdAt);
}

export function listPostsByUser(uid) {
    return mockPosts
        .filter((p) => p.createdBy === uid)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export function addPostMock({ createdBy, caption, imageURL }) {
    const post = {
        id: uuidv4(),
        caption,
        likes: [],
        comments: [],
        createdAt: Date.now(),
        createdBy,
        imageURL,
    };
    mockPosts.push(post);
    const user = mockUsers.find((u) => u.uid === createdBy);
    if (user) user.posts.push(post.id);
    return post;
}

export function toggleLikeMock(postId, uid) {
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");
    const idx = post.likes.indexOf(uid);
    if (idx === -1) post.likes.push(uid);
    else post.likes.splice(idx, 1);
    return { ...post };
}

export function addCommentMock(postId, comment) {
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");
    post.comments.push(comment);
    return { ...post };
}

export function updateUserMock(uid, updates) {
    const user = mockUsers.find((u) => u.uid === uid);
    if (!user) throw new Error("User not found");
    Object.assign(user, updates);
    return { ...user };
}

export function followToggleMock(currentUid, targetUid) {
    const me = mockUsers.find((u) => u.uid === currentUid);
    const target = mockUsers.find((u) => u.uid === targetUid);
    if (!me || !target) throw new Error("User not found");
    const i = me.following.indexOf(targetUid);
    if (i === -1) {
        me.following.push(targetUid);
        target.followers.push(currentUid);
    } else {
        me.following.splice(i, 1);
        const j = target.followers.indexOf(currentUid);
        if (j !== -1) target.followers.splice(j, 1);
    }
    return { me: { ...me }, target: { ...target } };
}

export function deletePostMock(postId, uid) {
    const idx = mockPosts.findIndex((p) => p.id === postId && p.createdBy === uid);
    if (idx === -1) throw new Error("Post not found or not owned");
    mockPosts.splice(idx, 1);
    const me = mockUsers.find((u) => u.uid === uid);
    if (me) me.posts = me.posts.filter((id) => id !== postId);
}


