/**
 * Generates NileCart Postman Collection v2.1 + local environment.
 * Run: node postman/generate-collection.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const uid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

const ERROR = {
  "400": { success: false, message: "Validation or business-rule error" },
  "401": { success: false, message: "Not authenticated" },
  "403": { success: false, message: "Not authorized" },
  "404": { success: false, message: "Resource not found" },
  "409": { success: false, message: "Conflict / duplicate" },
};

const USER = {
  _id: "64f0a1b2c3d4e5f678901234",
  email: "customer@example.com",
  name: "Ada Lovelace",
  mobileNumber: "+919876543210",
  gender: "Female",
  birthday: "1995-05-10T00:00:00.000Z",
  avatar: "https://cdn.example.com/profiles/avatar.jpg",
  categoryPreferences: ["women", "beauty"],
  role: "customer",
  isActive: true,
  isVerified: true,
  seller: null,
};

const STORED_IMAGE = {
  url: "https://cdn.example.com/products/img.jpg",
  key: "products/sellerId/uuid.jpg",
};

const PRODUCT = {
  _id: "64f0product000000000001",
  title: "Classic Cotton Tee",
  slug: "classic-cotton-tee",
  description: "Soft everyday tee",
  brand: "Nile Basics",
  category: "64f0category00000000001",
  gender: "Women",
  images: [STORED_IMAGE],
  tags: ["casual", "cotton"],
  discountPercent: 10,
  isTrending: true,
  isNewArrival: false,
  isOnSale: true,
  isActive: true,
  variants: [
    {
      sku: "TEE-BLK-M",
      size: "M",
      color: "Black",
      colorHex: "#000000",
      stock: 25,
      price: 899,
      mrp: 999,
      images: [STORED_IMAGE],
    },
  ],
};

const CART_RESPONSE = {
  success: true,
  cart: {
    _id: "64f0cart000000000000001",
    items: [
      {
        _id: "64f0cartitem00000000001",
        product: PRODUCT._id,
        variantSku: "TEE-BLK-M",
        quantity: 1,
        price: 899,
      },
    ],
    coupon: null,
  },
  subtotal: 899,
  discount: 0,
  shippingFee: 79,
  total: 978,
  itemCount: 1,
  freeShippingThreshold: 999,
  coupon: null,
};

const ORDER = {
  _id: "64f0order00000000000001",
  status: "placed",
  paymentMethod: "cod",
  paymentStatus: "pending",
  items: [],
  totals: { subtotal: 899, discount: 0, shippingFee: 79, total: 978 },
  shippingAddress: {},
  createdAt: "2026-08-02T12:00:00.000Z",
};

const PAGINATION = {
  page: 1,
  limit: 12,
  total: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function headerJson() {
  return [{ key: "Content-Type", value: "application/json" }];
}

function bearerAuth() {
  return {
    type: "bearer",
    bearer: [{ key: "token", value: "{{token}}", type: "string" }],
  };
}

function req(method, path, { body, query, auth, description, headers } = {}) {
  const urlPath = path.startsWith("/") ? path.slice(1) : path;
  const raw = `{{baseUrl}}/${urlPath}`.replace(/\/+/g, "/").replace(":/", "://");
  const queryArr = (query || []).map((q) => ({
    key: q.key,
    value: q.value,
    description: q.description || "",
    disabled: q.disabled ?? false,
  }));
  const item = {
    name: `${method} /${urlPath}`,
    request: {
      method,
      header: headers || (body ? headerJson() : []),
      url: {
        raw: queryArr.length
          ? `${raw}?${queryArr
              .filter((q) => !q.disabled)
              .map((q) => `${q.key}=${q.value}`)
              .join("&")}`
          : raw,
        host: ["{{baseUrl}}"],
        path: urlPath.split("/").filter(Boolean),
        query: queryArr.length ? queryArr : undefined,
      },
      description: description || "",
    },
    response: [],
  };
  if (auth === false) {
    item.request.auth = { type: "noauth" };
  } else if (auth === "bearer" || auth === true) {
    item.request.auth = bearerAuth();
  }
  if (body !== undefined) {
    item.request.body = {
      mode: "raw",
      raw: typeof body === "string" ? body : JSON.stringify(body, null, 2),
      options: { raw: { language: "json" } },
    };
  }
  return item;
}

function addResponses(item, examples = []) {
  item.response = examples.map((ex) => ({
    id: uid(),
    name: ex.name,
    originalRequest: item.request,
    status: ex.statusText || (String(ex.code).startsWith("2") ? "OK" : "Error"),
    code: ex.code,
    _postman_previewlanguage: "json",
    header: [{ key: "Content-Type", value: "application/json" }],
    body: JSON.stringify(ex.body, null, 2),
  }));
  return item;
}

function folder(name, description, items) {
  return {
    name,
    description: description || "",
    item: items,
  };
}

function saveTokenScript() {
  return {
    listen: "test",
    script: {
      type: "text/javascript",
      exec: [
        "try {",
        "  const json = pm.response.json();",
        "  if (json && json.token) {",
        "    pm.collectionVariables.set('token', json.token);",
        "    if (json.user && json.user._id) pm.collectionVariables.set('userId', json.user._id);",
        "    if (json.user && json.user.role) pm.collectionVariables.set('userRole', json.user.role);",
        "  }",
        "} catch (e) {}",
      ],
    },
  };
}

// ---------- Build collection ----------

const health = addResponses(
  req("GET", "health", {
    auth: false,
    description: "Health check. No auth.",
  }),
  [
    {
      name: "200 OK",
      code: 200,
      body: { success: true, message: "NileCart API is running" },
    },
  ]
);

const authFolder = folder(
  "Auth (`/auth` — also mounted at `/users`)",
  [
    "Auth is JWT via `Authorization: Bearer {{token}}` or httpOnly cookie `token`.",
    "OTP is 6 digits, expires in 600 seconds.",
    "Roles: `customer` | `seller` | `admin`.",
    "Providers: `password` | `google.com` | `apple.com`.",
    "Gender enum: `Male` | `Female` | `Other`.",
  ].join("\n"),
  [
    (() => {
      const i = addResponses(
        req("POST", "auth/send-otp", {
          auth: false,
          body: { email: "{{customerEmail}}" },
          description: "Send storefront customer OTP. Required: email.",
        }),
        [
          {
            name: "200 OTP sent",
            code: 200,
            body: {
              success: true,
              message: "OTP sent",
              email: "customer@example.com",
              expiresIn: 600,
            },
          },
          { name: "400 Invalid email", code: 400, body: ERROR["400"] },
        ]
      );
      return i;
    })(),
    (() => {
      const i = addResponses(
        req("POST", "auth/verify-otp", {
          auth: false,
          body: { email: "{{customerEmail}}", otp: "{{otp}}" },
          description:
            "Verify customer OTP. Required: email, otp. Sets cookie + returns token.",
        }),
        [
          {
            name: "200 Verified",
            code: 200,
            body: {
              success: true,
              user: USER,
              token: "<jwt>",
              isNewUser: false,
            },
          },
          { name: "400 Invalid OTP", code: 400, body: ERROR["400"] },
        ]
      );
      i.event = [saveTokenScript()];
      return i;
    })(),
    (() => {
      const i = addResponses(
        req("POST", "auth/dashboard/send-otp", {
          auth: false,
          body: { email: "{{sellerEmail}}", loginType: "seller" },
          description:
            "Dashboard OTP for seller/admin. Body: email, loginType?: `seller`|`admin` (default seller).",
        }),
        [
          {
            name: "200 OTP sent",
            code: 200,
            body: {
              success: true,
              message: "OTP sent",
              email: "seller@example.com",
              expiresIn: 600,
            },
          },
        ]
      );
      return i;
    })(),
    (() => {
      const i = addResponses(
        req("POST", "auth/dashboard/verify-otp", {
          auth: false,
          body: {
            email: "{{sellerEmail}}",
            otp: "{{otp}}",
            loginType: "seller",
          },
          description: "Verify dashboard OTP. Returns user + token.",
        }),
        [
          {
            name: "200 Verified",
            code: 200,
            body: {
              success: true,
              user: { ...USER, email: "seller@example.com", role: "seller" },
              token: "<jwt>",
            },
          },
        ]
      );
      i.event = [saveTokenScript()];
      return i;
    })(),
    (() => {
      const i = addResponses(
        req("POST", "auth/login", {
          auth: false,
          body: { email: "{{customerEmail}}", password: "{{password}}" },
          description:
            "Customer login. Body: `{ email, password }` OR `{ token }` (OAuth JWT). Password min 6 chars.",
        }),
        [
          {
            name: "200 Logged in",
            code: 200,
            body: { success: true, user: USER, token: "<jwt>" },
          },
          { name: "401 Invalid credentials", code: 401, body: ERROR["401"] },
        ]
      );
      i.event = [saveTokenScript()];
      return i;
    })(),
    addResponses(
      req("POST", "auth/seller/register", {
        auth: false,
        body: {
          email: "{{sellerEmail}}",
          password: "{{password}}",
          signInProvider: "password",
        },
        description:
          "Register seller account. Body: `{ email, password, signInProvider? }` OR `{ token }`.",
      }),
      [
        {
          name: "200 Needs verification",
          code: 200,
          body: {
            success: true,
            message: "Verification required",
            requiresVerification: true,
            email: "seller@example.com",
          },
        },
        {
          name: "200 Already verified",
          code: 200,
          body: {
            success: true,
            requiresVerification: false,
            isVerified: true,
            email: "seller@example.com",
          },
        },
      ]
    ),
    addResponses(
      req("POST", "auth/seller/send-otp", {
        auth: false,
        body: { email: "{{sellerEmail}}" },
        description: "Send seller signup OTP. Required: email.",
      }),
      [
        {
          name: "200 OTP sent",
          code: 200,
          body: {
            success: true,
            message: "OTP sent",
            email: "seller@example.com",
            expiresIn: 600,
          },
        },
      ]
    ),
    addResponses(
      req("POST", "auth/seller/verify-otp", {
        auth: false,
        body: { email: "{{sellerEmail}}", otp: "{{otp}}" },
        description: "Verify seller signup OTP. Required: email, otp.",
      }),
      [
        {
          name: "200 Verified",
          code: 200,
          body: {
            success: true,
            message: "Email verified",
            email: "seller@example.com",
            isVerified: true,
          },
        },
      ]
    ),
    (() => {
      const i = addResponses(
        req("POST", "auth/login/seller", {
          auth: false,
          body: { email: "{{sellerEmail}}", password: "{{password}}" },
          description: "Seller login. `{ email, password }` OR `{ token }`.",
        }),
        [
          {
            name: "200 Logged in",
            code: 200,
            body: {
              success: true,
              user: { ...USER, role: "seller", email: "seller@example.com" },
              token: "<jwt>",
            },
          },
        ]
      );
      i.event = [saveTokenScript()];
      return i;
    })(),
    (() => {
      const i = addResponses(
        req("POST", "auth/login/admin", {
          auth: false,
          body: { email: "{{adminEmail}}", password: "{{password}}" },
          description:
            "Admin login. `{ email, password }` OR `{ token }` + optional mobileNumber.",
        }),
        [
          {
            name: "200 Logged in",
            code: 200,
            body: {
              success: true,
              user: { ...USER, role: "admin", email: "admin@example.com" },
              token: "<jwt>",
            },
          },
        ]
      );
      i.event = [saveTokenScript()];
      return i;
    })(),
    addResponses(
      req("POST", "auth/logout", {
        auth: false,
        description: "Clears auth cookie. Works without auth.",
      }),
      [{ name: "200 Logged out", code: 200, body: { success: true, message: "Logged out" } }]
    ),
    addResponses(
      req("GET", "auth/me", {
        auth: true,
        description: "Current user profile. Requires JWT.",
      }),
      [
        { name: "200 Profile", code: 200, body: { success: true, user: USER } },
        { name: "401", code: 401, body: ERROR["401"] },
      ]
    ),
    addResponses(
      req("PUT", "auth/me", {
        auth: true,
        body: {
          name: "Ada Lovelace",
          mobileNumber: "+919876543210",
          birthday: "1995-05-10",
          gender: "Female",
          categoryPreferences: ["women", "beauty"],
          avatar: STORED_IMAGE,
        },
        description:
          "Update profile. Optional: name, mobileNumber, birthday, gender (`Male`|`Female`|`Other`), categoryPreferences (string[]), avatar `{url,key}`.",
      }),
      [{ name: "200 Updated", code: 200, body: { success: true, user: USER } }]
    ),
    addResponses(
      req("DELETE", "auth/me", {
        auth: true,
        description: "Delete account (customer only). Clears cookie.",
      }),
      [
        {
          name: "200 Deleted",
          code: 200,
          body: { success: true, message: "Account deleted" },
        },
        { name: "403 Not customer", code: 403, body: ERROR["403"] },
      ]
    ),
  ]
);

const sellersFolder = folder(
  "Sellers",
  "Seller apply/profile. approvalStatus: `Pending`|`Approved`|`Rejected`.",
  [
    addResponses(
      req("POST", "sellers/apply", {
        auth: true,
        body: {
          name: "Jane Seller",
          mobileNumber: "+919876543210",
          storeName: "Nile Closet",
          nationalId: "ID1234567890",
          description: "Curated fashion",
          tinNumber: "TIN-001",
          address: {
            addressLine: "12 Market St",
            city: "Addis Ababa",
            state: "Addis Ababa",
            country: "Ethiopia",
            pincode: "1000",
          },
          bankDetails: {
            accountHolderName: "Jane Seller",
            accountNumber: "1234567890",
            ifscCode: "BANK0001",
          },
          documents: {
            idProof: STORED_IMAGE,
            businessProof: STORED_IMAGE,
            addressProof: STORED_IMAGE,
          },
          logo: STORED_IMAGE,
          banner: STORED_IMAGE,
        },
        description:
          "Apply as seller. Auth: JWT role `seller`. Required: name, mobileNumber, storeName, nationalId.",
      }),
      [
        {
          name: "201 Created",
          code: 201,
          statusText: "Created",
          body: {
            success: true,
            seller: {
              _id: "{{sellerId}}",
              storeName: "Nile Closet",
              approvalStatus: "Pending",
              slug: "nile-closet",
            },
          },
        },
      ]
    ),
    addResponses(
      req("GET", "sellers/me/profile", {
        auth: true,
        description: "Get own seller profile. Requires seller profile.",
      }),
      [
        {
          name: "200",
          code: 200,
          body: {
            success: true,
            seller: {
              _id: "{{sellerId}}",
              storeName: "Nile Closet",
              approvalStatus: "Approved",
              commissionRate: 10,
            },
          },
        },
      ]
    ),
    addResponses(
      req("PATCH", "sellers/me/profile", {
        auth: true,
        body: {
          description: "Updated store description",
          logo: STORED_IMAGE,
          banner: STORED_IMAGE,
          address: {
            addressLine: "12 Market St",
            city: "Addis Ababa",
            state: "Addis Ababa",
            country: "Ethiopia",
            pincode: "1000",
          },
          bankDetails: {
            accountHolderName: "Jane Seller",
            accountNumber: "1234567890",
            ifscCode: "BANK0001",
          },
        },
        description:
          "Update seller profile. Pending/Rejected: more fields; Approved: logo, banner, description, address, bankDetails, documents.",
      }),
      [{ name: "200", code: 200, body: { success: true, seller: { storeName: "Nile Closet" } } }]
    ),
    addResponses(
      req("GET", "sellers/me/stats", {
        auth: true,
        description: "Seller dashboard stats. Requires approved seller.",
      }),
      [
        {
          name: "200",
          code: 200,
          body: {
            success: true,
            stats: { productCount: 12, totalOrders: 40, pendingOrders: 3 },
          },
        },
      ]
    ),
    addResponses(
      req("GET", "sellers/{{storeSlug}}", {
        auth: false,
        description:
          "Public store by slug. If 24-char ObjectId, requires JWT (admin/dashboard lookup).",
      }),
      [
        {
          name: "200 Public",
          code: 200,
          body: {
            success: true,
            seller: {
              storeName: "Nile Closet",
              slug: "nile-closet",
              description: "Curated fashion",
              logo: STORED_IMAGE,
            },
          },
        },
      ]
    ),
  ]
);

const adminSellers = folder("Sellers", "", [
  addResponses(
    req("GET", "admin/sellers", {
      auth: true,
      query: [
        {
          key: "status",
          value: "Pending",
          description: "Pending | Approved | Rejected",
        },
      ],
      description: "List sellers. Query: status?",
    }),
    [{ name: "200", code: 200, body: { success: true, sellers: [] } }]
  ),
  addResponses(
    req("GET", "admin/sellers/{{sellerId}}", { auth: true }),
    [{ name: "200", code: 200, body: { success: true, seller: {} } }]
  ),
  addResponses(
    req("PATCH", "admin/sellers/{{sellerId}}/approve", {
      auth: true,
      body: { commissionRate: 10 },
      description: "Approve seller. Optional: commissionRate (number).",
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          seller: { approvalStatus: "Approved" },
          message: "Seller approved",
        },
      },
    ]
  ),
  addResponses(
    req("PATCH", "admin/sellers/{{sellerId}}/reject", {
      auth: true,
      body: { reason: "Incomplete documents" },
      description: "Reject seller. Required: reason.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          seller: { approvalStatus: "Rejected" },
          message: "Seller rejected",
        },
      },
    ]
  ),
  addResponses(
    req("PATCH", "admin/sellers/{{sellerId}}/deactivate", {
      auth: true,
      body: { reason: "Policy violation" },
      description: "Deactivate seller. Optional: reason.",
    }),
    [{ name: "200", code: 200, body: { success: true, seller: {}, message: "Deactivated" } }]
  ),
  addResponses(
    req("PATCH", "admin/sellers/{{sellerId}}/reactivate", {
      auth: true,
      description: "Reactivate seller.",
    }),
    [{ name: "200", code: 200, body: { success: true, seller: {}, message: "Reactivated" } }]
  ),
]);

const adminUsers = folder("Users", "", [
  addResponses(
    req("GET", "admin/users", {
      auth: true,
      query: [
        {
          key: "role",
          value: "customer",
          description: "customer | seller | admin",
        },
      ],
    }),
    [{ name: "200", code: 200, body: { success: true, users: [] } }]
  ),
  addResponses(
    req("PATCH", "admin/users/{{userId}}/status", {
      auth: true,
      body: { isActive: false },
      description: "Set user active flag. Required: isActive (boolean).",
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, user: { isActive: false }, message: "Updated" },
      },
    ]
  ),
]);

const adminOrders = folder("Orders", "", [
  addResponses(
    req("GET", "admin/orders", {
      auth: true,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        {
          key: "status",
          value: "placed",
          description:
            "placed|confirmed|packed|shipped|out_for_delivery|delivered|cancelled|returned",
        },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, orders: [], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(
    req("PATCH", "admin/orders/{{orderId}}/status", {
      auth: true,
      body: { status: "confirmed", note: "Verified payment" },
      description: "Update order status. Required: status (OrderStatus). Optional: note.",
    }),
    [{ name: "200", code: 200, body: { success: true, order: ORDER } }]
  ),
]);

const adminCoupons = folder("Coupons", "", [
  addResponses(req("GET", "admin/coupons", { auth: true }), [
    { name: "200", code: 200, body: { success: true, coupons: [] } },
  ]),
  addResponses(
    req("POST", "admin/coupons", {
      auth: true,
      body: {
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        description: "10% off",
        minOrderAmount: 500,
        maxDiscount: 200,
        usageLimit: 1000,
        maxUsesPerUser: 1,
        restoreOnCancel: true,
        eligibleUserType: "all",
        sponsoredBy: "platform",
        seller: null,
        applicableCategories: [],
        applicableProducts: [],
        startsAt: "2026-08-01T00:00:00.000Z",
        endsAt: "2026-12-31T23:59:59.000Z",
        isActive: true,
      },
      description:
        "Create coupon. Required: code, discountType (`percentage`|`flat`), discountValue. eligibleUserType: `all`|`new`|`returning`. sponsoredBy: `platform`|`seller`.",
    }),
    [
      {
        name: "201 Created",
        code: 201,
        statusText: "Created",
        body: { success: true, coupon: { code: "SAVE10", isActive: true } },
      },
    ]
  ),
  addResponses(
    req("PUT", "admin/coupons/{{couponId}}", {
      auth: true,
      body: {
        discountValue: 15,
        description: "Updated 15% off",
        isActive: true,
      },
      description: "Update coupon (partial). code optional.",
    }),
    [{ name: "200", code: 200, body: { success: true, coupon: { code: "SAVE10" } } }]
  ),
  addResponses(
    req("PATCH", "admin/coupons/{{couponId}}/status", {
      auth: true,
      body: { isActive: false },
      description: "Toggle/set coupon status. isActive optional (omit = toggle).",
    }),
    [{ name: "200", code: 200, body: { success: true, coupon: { isActive: false } } }]
  ),
]);

const adminBanners = folder("Banners", "", [
  addResponses(req("GET", "admin/banners", { auth: true }), [
    { name: "200", code: 200, body: { success: true, banners: [] } },
  ]),
  addResponses(
    req("POST", "admin/banners", {
      auth: true,
      body: {
        title: "Summer Sale",
        subtitle: "Up to 40% off",
        description: "Seasonal promo",
        image: STORED_IMAGE,
        mobileImage: STORED_IMAGE,
        type: "hero",
        ctaText: "Shop now",
        ctaLink: "/shop",
        deepLink: { kind: "category", ref: "women", url: null },
        displayOrder: 1,
        priority: 10,
        startsAt: "2026-08-01T00:00:00.000Z",
        endsAt: "2026-08-31T23:59:59.000Z",
        isActive: true,
        targeting: { devices: ["all"], auth: "all" },
      },
      description:
        "Create banner. Required: title, image. type: `hero`|`promotional`|`category`|`offer`|`collection`|`flash_sale`. deepLink.kind: `product`|`category`|`brand`|`collection`|`external`|`page`. targeting.devices: `all`|`desktop`|`mobile`. targeting.auth: `all`|`guest`|`authenticated`.",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, banner: { title: "Summer Sale", type: "hero" } },
      },
    ]
  ),
  addResponses(
    req("PUT", "admin/banners/reorder", {
      auth: true,
      body: {
        items: [
          { id: "{{bannerId}}", displayOrder: 1 },
          { _id: "64f0banner0000000000002", displayOrder: 2 },
        ],
      },
      description: "Reorder banners. Body: items[{ id|_id, displayOrder? }].",
    }),
    [{ name: "200", code: 200, body: { success: true, banners: [] } }]
  ),
  addResponses(
    req("PUT", "admin/banners/{{bannerId}}", {
      auth: true,
      body: { title: "Updated Summer Sale", isActive: true },
    }),
    [{ name: "200", code: 200, body: { success: true, banner: {} } }]
  ),
  addResponses(
    req("PATCH", "admin/banners/{{bannerId}}/status", {
      auth: true,
      body: { isActive: false },
    }),
    [{ name: "200", code: 200, body: { success: true, banner: { isActive: false } } }]
  ),
  addResponses(
    req("DELETE", "admin/banners/{{bannerId}}", {
      auth: true,
      description: "Soft-deactivate banner.",
    }),
    [{ name: "200", code: 200, body: { success: true, message: "Banner deactivated" } }]
  ),
]);

const adminCategories = folder("Categories", "", [
  addResponses(
    req("GET", "admin/categories", {
      auth: true,
      description: "Lists all categories including inactive.",
    }),
    [{ name: "200", code: 200, body: { success: true, categories: [] } }]
  ),
  addResponses(
    req("POST", "admin/categories", {
      auth: true,
      body: {
        name: "Dresses",
        image: STORED_IMAGE,
        description: "Women dresses",
        parent: null,
        displayOrder: 1,
        showInNav: true,
        department: "women",
      },
      description:
        "Create category. Required: name. department: `men`|`women`|`kids`|`sports`|`beauty`|`home`|`accessories`.",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, category: { name: "Dresses", slug: "dresses" } },
      },
    ]
  ),
  addResponses(
    req("PUT", "admin/categories/{{categoryId}}", {
      auth: true,
      body: {
        name: "Dresses",
        description: "Updated",
        displayOrder: 2,
        showInNav: true,
        isActive: true,
        department: "women",
      },
    }),
    [{ name: "200", code: 200, body: { success: true, category: {} } }]
  ),
  addResponses(
    req("DELETE", "admin/categories/{{categoryId}}", {
      auth: true,
      description: "Soft-deactivate category.",
    }),
    [{ name: "200", code: 200, body: { success: true, message: "Category deactivated" } }]
  ),
]);

function crudAdminResource({
  name,
  base,
  createBody,
  updateBody,
  createDescription,
  listKey,
  softDelete = true,
}) {
  const items = [
    addResponses(req("GET", `admin/${base}`, { auth: true }), [
      { name: "200", code: 200, body: { success: true, [listKey]: [] } },
    ]),
    addResponses(
      req("POST", `admin/${base}`, {
        auth: true,
        body: createBody,
        description: createDescription,
      }),
      [
        {
          name: "201",
          code: 201,
          statusText: "Created",
          body: { success: true, [listKey.slice(0, -1)]: createBody },
        },
      ]
    ),
    addResponses(
      req("PUT", `admin/${base}/{{${name}Id}}`, {
        auth: true,
        body: updateBody,
      }),
      [{ name: "200", code: 200, body: { success: true, [listKey.slice(0, -1)]: {} } }]
    ),
    addResponses(
      req("PATCH", `admin/${base}/{{${name}Id}}/status`, {
        auth: true,
        body: { isActive: false },
        description: "Toggle/set isActive. Omit body field to toggle.",
      }),
      [{ name: "200", code: 200, body: { success: true, [listKey.slice(0, -1)]: { isActive: false } } }]
    ),
    addResponses(
      req("DELETE", `admin/${base}/{{${name}Id}}`, {
        auth: true,
        description: softDelete ? "Soft-deactivate." : "Hard delete.",
      }),
      [{ name: "200", code: 200, body: { success: true, message: "Deleted" } }]
    ),
  ];
  return folder(name, "", items);
}

const adminAnnouncements = crudAdminResource({
  name: "announcement",
  base: "announcements",
  listKey: "announcements",
  createBody: {
    message: "Free shipping over 999",
    type: "top_bar",
    isActive: true,
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-12-31T23:59:59.000Z",
  },
  updateBody: { message: "Updated announcement", isActive: true },
  createDescription:
    "Required: message. type: `top_bar`|`sticky`|`campaign`|`seasonal`|`shipping`|`maintenance`.",
});

const adminHomeSections = folder("Home Sections", "", [
  addResponses(req("GET", "admin/home-sections", { auth: true }), [
    { name: "200", code: 200, body: { success: true, sections: [] } },
  ]),
  addResponses(
    req("POST", "admin/home-sections", {
      auth: true,
      body: {
        key: "trending-rail",
        type: "recommended_products",
        title: "Trending Now",
        subtitle: "Popular picks",
        displayOrder: 30,
        isActive: true,
        config: { productSource: "trending", layout: "grid", limit: 8 },
      },
      description:
        "Required: key, type. type: `hero_banner`|`announcement_bar`|`promotional_campaign`|`flash_sale`|`category_highlights`|`brand_showcase`|`featured_collection`|`recommended_products`|`seasonal_campaign`|`custom_marketing`|`popup_campaign`.",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, section: { key: "trending-rail" } },
      },
    ]
  ),
  addResponses(
    req("PUT", "admin/home-sections/reorder", {
      auth: true,
      body: { items: [{ id: "{{homeSectionId}}", displayOrder: 10 }] },
    }),
    [{ name: "200", code: 200, body: { success: true, sections: [] } }]
  ),
  addResponses(
    req("PUT", "admin/home-sections/{{homeSectionId}}", {
      auth: true,
      body: { title: "Updated", isActive: true },
    }),
    [{ name: "200", code: 200, body: { success: true, section: {} } }]
  ),
  addResponses(
    req("PATCH", "admin/home-sections/{{homeSectionId}}/status", {
      auth: true,
      body: { isActive: false },
    }),
    [{ name: "200", code: 200, body: { success: true, section: { isActive: false } } }]
  ),
  addResponses(
    req("DELETE", "admin/home-sections/{{homeSectionId}}", {
      auth: true,
      description: "Hard delete home section.",
    }),
    [{ name: "200", code: 200, body: { success: true, message: "Deleted" } }]
  ),
]);

const adminCampaigns = crudAdminResource({
  name: "campaign",
  base: "campaigns",
  listKey: "campaigns",
  createBody: {
    name: "monsoon-2026",
    title: "Monsoon Edit",
    type: "seasonal",
    subtitle: "Rain-ready styles",
    popupFrequency: "once",
    isActive: true,
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-09-30T23:59:59.000Z",
  },
  updateBody: { title: "Updated Monsoon Edit", isActive: true },
  createDescription:
    "Required: name, title. type: `promotional`|`seasonal`|`custom`|`popup`. popupFrequency: `once`|`session`|`always`.",
});

const adminCollections = crudAdminResource({
  name: "collection",
  base: "collections",
  listKey: "collections",
  createBody: {
    name: "essentials",
    title: "Everyday Essentials",
    productIds: ["{{productId}}"],
    isActive: true,
  },
  updateBody: { title: "Updated Essentials", productIds: ["{{productId}}"] },
  createDescription: "Required: name, title. Optional: productIds[].",
});

const adminFlashSales = crudAdminResource({
  name: "flashSale",
  base: "flash-sales",
  listKey: "flashSales",
  createBody: {
    name: "weekend-flash",
    title: "Weekend Flash",
    startsAt: "2026-08-08T00:00:00.000Z",
    endsAt: "2026-08-10T23:59:59.000Z",
    productSource: "ids",
    productIds: ["{{productId}}"],
    isActive: true,
  },
  updateBody: { title: "Updated Flash", isActive: true },
  createDescription:
    "Required: name, title, startsAt, endsAt. productSource: `ids`|`sale`.",
});

const adminBrands = crudAdminResource({
  name: "brand",
  base: "brands",
  listKey: "brands",
  createBody: {
    name: "Nile Basics",
    slug: "nile-basics",
    logo: STORED_IMAGE,
    isActive: true,
  },
  updateBody: { name: "Nile Basics", isActive: true },
  createDescription: "Required: name. Optional: slug, logo, isActive.",
});

const adminFolder = folder(
  "Admin (JWT + role `admin`)",
  "All routes require Authorization Bearer token for an admin user.",
  [
    addResponses(req("GET", "admin/stats", { auth: true }), [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          stats: {
            pendingSellers: 2,
            totalSellers: 20,
            ordersToday: 5,
            activeCoupons: 3,
            activeBanners: 4,
            totalOrders: 120,
          },
        },
      },
    ]),
    adminSellers,
    adminUsers,
    adminOrders,
    adminCoupons,
    adminBanners,
    adminCategories,
    adminAnnouncements,
    adminHomeSections,
    adminCampaigns,
    adminCollections,
    adminFlashSales,
    adminBrands,
  ]
);

const categoriesFolder = folder("Categories (public)", "", [
  addResponses(
    req("GET", "categories", {
      auth: false,
      query: [
        { key: "navOnly", value: "true", disabled: true },
        { key: "includeInactive", value: "true", disabled: true },
        { key: "tree", value: "true", disabled: true },
        { key: "navigation", value: "true", disabled: true },
        { key: "parentId", value: "", disabled: true },
        { key: "rootsOnly", value: "true", disabled: true },
        { key: "subcategoriesOnly", value: "true", disabled: true },
        { key: "department", value: "women", disabled: true },
        { key: "departmentsOnly", value: "true", disabled: true },
      ],
      description: "List categories. Flags are string `true` where applicable.",
    }),
    [{ name: "200", code: 200, body: { success: true, categories: [] } }]
  ),
  addResponses(req("GET", "categories/navigation", { auth: false }), [
    { name: "200", code: 200, body: { success: true, departments: [] } },
  ]),
  addResponses(req("GET", "categories/{{categorySlug}}", { auth: false }), [
    {
      name: "200",
      code: 200,
      body: { success: true, category: { slug: "dresses" }, children: [] },
    },
  ]),
  addResponses(
    req("GET", "categories/{{categorySlug}}/shop", {
      auth: false,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "12", description: "Max 48" },
        { key: "sort", value: "newest", disabled: true },
        { key: "brand", value: "nile-basics", disabled: true, description: "CSV slugs" },
        { key: "size", value: "M", disabled: true },
        { key: "color", value: "Black", disabled: true },
        { key: "isOnSale", value: "true", disabled: true },
        { key: "isTrending", value: "true", disabled: true },
        { key: "minPrice", value: "100", disabled: true },
        { key: "maxPrice", value: "5000", disabled: true },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          category: {},
          children: [],
          facets: {},
          products: [],
          pagination: PAGINATION,
        },
      },
    ]
  ),
]);

const productsFolder = folder("Products", "", [
  addResponses(
    req("GET", "products", {
      auth: false,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "12", description: "Max 50" },
        { key: "sort", value: "newest", disabled: true },
        { key: "category", value: "dresses", disabled: true },
        { key: "brand", value: "nile-basics", disabled: true },
        { key: "gender", value: "Women", description: "Women | Men", disabled: true },
        { key: "minPrice", value: "100", disabled: true },
        { key: "maxPrice", value: "5000", disabled: true },
        { key: "isTrending", value: "true", disabled: true },
        { key: "isNewArrival", value: "true", disabled: true },
        { key: "isOnSale", value: "true", disabled: true },
        { key: "search", value: "tee", disabled: true },
        { key: "seller", value: "{{sellerId}}", disabled: true },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, products: [PRODUCT], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(
    req("GET", "products/trending", {
      auth: false,
      query: [{ key: "limit", value: "8", description: "Max 20" }],
    }),
    [{ name: "200", code: 200, body: { success: true, products: [PRODUCT] } }]
  ),
  addResponses(
    req("GET", "products/search", {
      auth: false,
      query: [
        { key: "q", value: "cotton tee" },
        { key: "page", value: "1" },
        { key: "limit", value: "12" },
      ],
      description: "Search. Use `q` or `search`.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, products: [PRODUCT], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(
    req("GET", "products/mine", {
      auth: true,
      query: [{ key: "isActive", value: "true", description: "true | false" }],
      description: "Seller's own products. Requires approved seller.",
    }),
    [{ name: "200", code: 200, body: { success: true, products: [PRODUCT] } }]
  ),
  addResponses(
    req("GET", "products/store/{{storeSlug}}", {
      auth: false,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "12" },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, products: [PRODUCT], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(req("GET", "products/{{productSlug}}", { auth: false }), [
    { name: "200", code: 200, body: { success: true, product: PRODUCT } },
    { name: "404", code: 404, body: ERROR["404"] },
  ]),
  addResponses(
    req("POST", "products", {
      auth: true,
      body: {
        title: "Classic Cotton Tee",
        description: "Soft everyday tee",
        category: "{{categoryId}}",
        brand: "Nile Basics",
        gender: "Women",
        images: [STORED_IMAGE],
        tags: ["casual", "cotton"],
        discountPercent: 10,
        isTrending: false,
        isNewArrival: true,
        isOnSale: true,
        variants: [
          {
            sku: "TEE-BLK-M",
            size: "M",
            color: "Black",
            colorHex: "#000000",
            stock: 25,
            price: 899,
            mrp: 999,
            images: [STORED_IMAGE],
          },
        ],
      },
      description:
        "Create product. Required: title, category, variants[]. If admin: seller required. Auth: approved seller (or admin).",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, product: PRODUCT },
      },
    ]
  ),
  addResponses(
    req("PUT", "products/{{productId}}", {
      auth: true,
      body: {
        title: "Classic Cotton Tee (Updated)",
        description: "Updated description",
        discountPercent: 15,
        variants: PRODUCT.variants,
      },
      description: "Update own product. Cannot change seller, _id, slug.",
    }),
    [{ name: "200", code: 200, body: { success: true, product: PRODUCT } }]
  ),
  addResponses(
    req("DELETE", "products/{{productId}}", {
      auth: true,
      description: "Soft-deactivate product.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, message: "Product deactivated" },
      },
    ]
  ),
]);

const marketingFolder = folder(
  "Marketing (public)",
  "Banners/announcements use optionalAuth (token optional for targeting).",
  [
    addResponses(
      req("GET", "banners", {
        auth: false,
        query: [
          {
            key: "device",
            value: "desktop",
            description: "mobile | desktop",
            disabled: true,
          },
        ],
      }),
      [{ name: "200", code: 200, body: { success: true, banners: [] } }]
    ),
    addResponses(
      req("GET", "announcements", {
        auth: false,
        query: [{ key: "device", value: "desktop", disabled: true }],
      }),
      [{ name: "200", code: 200, body: { success: true, announcements: [] } }]
    ),
    addResponses(req("GET", "announcements/{{announcementId}}", { auth: false }), [
      { name: "200", code: 200, body: { success: true, announcement: {} } },
    ]),
    addResponses(req("GET", "home", { auth: false }), [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          announcement: null,
          sections: [],
          popup: null,
        },
      },
    ]),
    addResponses(
      req("GET", "campaigns", {
        auth: false,
        query: [
          {
            key: "type",
            value: "seasonal",
            disabled: true,
            description: "promotional|seasonal|custom|popup",
          },
        ],
      }),
      [{ name: "200", code: 200, body: { success: true, campaigns: [] } }]
    ),
    addResponses(req("GET", "collections", { auth: false }), [
      { name: "200", code: 200, body: { success: true, collections: [] } },
    ]),
    addResponses(req("GET", "collections/{{collectionSlug}}", { auth: false }), [
      {
        name: "200",
        code: 200,
        body: { success: true, collection: {}, products: [] },
      },
    ]),
    addResponses(req("GET", "flash-sales", { auth: false }), [
      { name: "200", code: 200, body: { success: true, flashSales: [] } },
    ]),
    addResponses(req("GET", "brands", { auth: false }), [
      { name: "200", code: 200, body: { success: true, brands: [] } },
    ]),
  ]
);

const cartFolder = folder(
  "Cart (JWT)",
  "Free shipping threshold: 999. Standard shipping fee: 79.",
  [
    addResponses(req("GET", "cart", { auth: true }), [
      { name: "200", code: 200, body: CART_RESPONSE },
    ]),
    addResponses(
      req("POST", "cart/items", {
        auth: true,
        body: {
          productId: "{{productId}}",
          variantSku: "{{variantSku}}",
          quantity: 1,
        },
        description: "Required: productId, variantSku. quantity defaults to 1.",
      }),
      [{ name: "201", code: 201, statusText: "Created", body: CART_RESPONSE }]
    ),
    addResponses(
      req("PUT", "cart/items/{{cartItemId}}", {
        auth: true,
        body: { quantity: 2 },
        description: "quantity < 1 removes the item.",
      }),
      [{ name: "200", code: 200, body: CART_RESPONSE }]
    ),
    addResponses(req("DELETE", "cart/items/{{cartItemId}}", { auth: true }), [
      { name: "200", code: 200, body: CART_RESPONSE },
    ]),
    addResponses(req("DELETE", "cart", { auth: true, description: "Clear cart." }), [
      {
        name: "200",
        code: 200,
        body: { success: true, cart: { items: [] } },
      },
    ]),
    addResponses(
      req("POST", "cart/coupon", {
        auth: true,
        body: { code: "SAVE10" },
        description: "Apply coupon. Required: code.",
      }),
      [
        {
          name: "200",
          code: 200,
          body: { ...CART_RESPONSE, discount: 90, total: 888, coupon: { code: "SAVE10" } },
        },
      ]
    ),
    addResponses(req("DELETE", "cart/coupon", { auth: true }), [
      { name: "200", code: 200, body: CART_RESPONSE },
    ]),
  ]
);

const wishlistFolder = folder("Wishlist (JWT)", "", [
  addResponses(req("GET", "wishlist", { auth: true }), [
    {
      name: "200",
      code: 200,
      body: { success: true, wishlist: {}, products: [], count: 0 },
    },
  ]),
  addResponses(
    req("POST", "wishlist", {
      auth: true,
      body: { productId: "{{productId}}" },
      description: "Required: productId.",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, wishlist: {} },
      },
    ]
  ),
  addResponses(
    req("POST", "wishlist/toggle", {
      auth: true,
      body: { productId: "{{productId}}" },
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, inWishlist: true, wishlist: {} },
      },
    ]
  ),
  addResponses(req("DELETE", "wishlist/{{productId}}", { auth: true }), [
    {
      name: "200",
      code: 200,
      body: { success: true, wishlist: {}, message: "Removed" },
    },
  ]),
]);

const addressesFolder = folder("Addresses (JWT)", "", [
  addResponses(req("GET", "addresses", { auth: true }), [
    { name: "200", code: 200, body: { success: true, addresses: [] } },
  ]),
  addResponses(
    req("POST", "addresses", {
      auth: true,
      body: {
        fullName: "Ada Lovelace",
        mobileNumber: "+919876543210",
        pincode: "560001",
        addressLine: "42 Algorithm Ave",
        locality: "MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        addressType: "Home",
        isDefault: true,
      },
      description:
        "Required: fullName, mobileNumber, pincode, addressLine, city, state. addressType: `Home`|`Work`|`Other`. country defaults to India.",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: {
          success: true,
          address: {
            _id: "{{addressId}}",
            fullName: "Ada Lovelace",
            isDefault: true,
          },
        },
      },
    ]
  ),
  addResponses(
    req("PUT", "addresses/{{addressId}}", {
      auth: true,
      body: {
        fullName: "Ada Lovelace",
        mobileNumber: "+919876543210",
        pincode: "560001",
        addressLine: "42 Algorithm Ave",
        city: "Bengaluru",
        state: "Karnataka",
        addressType: "Work",
      },
    }),
    [{ name: "200", code: 200, body: { success: true, address: {} } }]
  ),
  addResponses(req("DELETE", "addresses/{{addressId}}", { auth: true }), [
    { name: "200", code: 200, body: { success: true, message: "Address deleted" } },
  ]),
  addResponses(
    req("PATCH", "addresses/{{addressId}}/default", {
      auth: true,
      description: "Set address as default.",
    }),
    [{ name: "200", code: 200, body: { success: true, address: { isDefault: true } } }]
  ),
]);

const ordersFolder = folder("Orders", "", [
  addResponses(req("GET", "orders/summary", { auth: false }), [
    {
      name: "200",
      code: 200,
      body: {
        success: true,
        freeShippingThreshold: 999,
        standardShippingFee: 79,
      },
    },
  ]),
  addResponses(
    req("GET", "orders/seller", {
      auth: true,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "status", value: "placed", disabled: true },
      ],
      description: "Seller order list. Requires approved seller.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, orders: [], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(req("GET", "orders/seller/{{orderId}}", { auth: true }), [
    { name: "200", code: 200, body: { success: true, order: ORDER } },
  ]),
  addResponses(
    req("PATCH", "orders/seller/{{orderId}}/status", {
      auth: true,
      body: { status: "confirmed", note: "Packing soon" },
      description:
        "Seller status updates. status: `confirmed`|`packed`|`shipped`|`out_for_delivery`|`delivered`. Optional: note.",
    }),
    [{ name: "200", code: 200, body: { success: true, order: { ...ORDER, status: "confirmed" } } }]
  ),
  addResponses(
    req("POST", "orders", {
      auth: true,
      body: { addressId: "{{addressId}}", paymentMethod: "cod" },
      description:
        "Place COD order only. paymentMethod: `cod` (online must use /payments/checkout).",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: { success: true, order: ORDER },
      },
    ]
  ),
  addResponses(
    req("GET", "orders", {
      auth: true,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "status", value: "placed", disabled: true },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, orders: [ORDER], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(req("GET", "orders/{{orderId}}", { auth: true }), [
    { name: "200", code: 200, body: { success: true, order: ORDER } },
  ]),
  addResponses(
    req("PATCH", "orders/{{orderId}}/cancel", {
      auth: true,
      body: { reason: "Changed mind" },
      description: "Cancel own order. Optional: reason.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, order: { ...ORDER, status: "cancelled" } },
      },
    ]
  ),
]);

const couponsFolder = folder("Coupons (public)", "", [
  addResponses(req("GET", "coupons/active", { auth: false }), [
    { name: "200", code: 200, body: { success: true, coupons: [] } },
  ]),
  addResponses(
    req("POST", "coupons/validate", {
      auth: false,
      body: { code: "SAVE10", orderAmount: 1500 },
      description:
        "Validate coupon. Required: code. Optional: orderAmount. Auth optional for user-specific rules.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          coupon: { code: "SAVE10", discountType: "percentage", discountValue: 10 },
          discount: 150,
        },
      },
    ]
  ),
]);

const reviewsFolder = folder("Reviews", "", [
  addResponses(
    req("GET", "reviews/product/{{productId}}", {
      auth: false,
      query: [
        { key: "page", value: "1" },
        { key: "limit", value: "10" },
      ],
    }),
    [
      {
        name: "200",
        code: 200,
        body: { success: true, reviews: [], pagination: PAGINATION },
      },
    ]
  ),
  addResponses(
    req("POST", "reviews", {
      auth: true,
      body: {
        productId: "{{productId}}",
        rating: 5,
        title: "Great fit",
        comment: "Soft fabric and true to size.",
        orderId: "{{orderId}}",
        images: [STORED_IMAGE],
      },
      description: "Required: productId, rating (1–5). Optional: title, comment, orderId, images[].",
    }),
    [
      {
        name: "201",
        code: 201,
        statusText: "Created",
        body: {
          success: true,
          review: { productId: "{{productId}}", rating: 5 },
        },
      },
    ]
  ),
  addResponses(req("DELETE", "reviews/{{reviewId}}", { auth: true }), [
    { name: "200", code: 200, body: { success: true, message: "Review deleted" } },
  ]),
]);

const uploadsFolder = folder(
  "Uploads (JWT)",
  [
    "No multipart on this API. Presign then PUT binary to uploadUrl with matching Content-Type.",
    "folder: `products`|`store-logos`|`store-banners`|`profiles`|`platform-banners`|`categories`|`marketing`|`seller-documents`.",
    "documentType (required if folder=seller-documents): `id-proof`|`business-proof`|`address-proof`.",
    "contentType: `image/jpeg`|`image/jpg`|`image/png`|`image/webp`.",
  ].join("\n"),
  [
    addResponses(
      req("POST", "uploads/presign", {
        auth: true,
        body: {
          fileName: "tee-front.jpg",
          contentType: "image/jpeg",
          folder: "products",
        },
        description: "Required: fileName, contentType. Optional: folder, documentType.",
      }),
      [
        {
          name: "200",
          code: 200,
          body: {
            success: true,
            uploadUrl: "https://s3.amazonaws.com/bucket/presigned...",
            fileUrl: "https://cdn.example.com/products/sellerId/uuid.jpg",
            key: "products/sellerId/uuid.jpg",
            expiresIn: 300,
          },
        },
      ]
    ),
    addResponses(
      req("POST", "uploads/presign", {
        auth: true,
        body: {
          fileName: "id-proof.pdf",
          contentType: "image/jpeg",
          folder: "seller-documents",
          documentType: "id-proof",
        },
        description: "Seller document upload example.",
      }),
      [
        {
          name: "200",
          code: 200,
          body: {
            success: true,
            uploadUrl: "https://s3.amazonaws.com/...",
            fileUrl: "https://cdn.example.com/seller-documents/...",
            key: "seller-documents/id-proof/uuid.jpg",
            expiresIn: 300,
          },
        },
      ]
    ),
    addResponses(
      req("DELETE", "uploads/delete", {
        auth: true,
        body: { key: "products/sellerId/uuid.jpg" },
        description: "Required: key (S3 object key).",
      }),
      [{ name: "200", code: 200, body: { success: true, message: "Deleted" } }]
    ),
  ]
);

const paymentsFolder = folder("Payments", "", [
  addResponses(req("GET", "payments/config", { auth: false }), [
    {
      name: "200",
      code: 200,
      body: {
        success: true,
        currency: "ETB",
        currencySymbol: "Br",
        onlinePaymentsEnabled: true,
        capabilities: {},
        paymentOptions: ["cod", "card"],
      },
    },
  ]),
  addResponses(
    req("POST", "payments/checkout", {
      auth: true,
      body: { addressId: "{{addressId}}" },
      description: "Start Flutterwave checkout. Required: addressId. Returns checkoutUrl + txRef.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          order: { ...ORDER, paymentMethod: "card", paymentStatus: "pending" },
          checkoutUrl: "https://checkout.flutterwave.com/...",
          txRef: "NC-TX-REF-001",
        },
      },
    ]
  ),
  addResponses(
    req("GET", "payments/verify", {
      auth: true,
      query: [
        { key: "tx_ref", value: "{{txRef}}", description: "or txRef" },
        { key: "transaction_id", value: "", disabled: true },
        { key: "status", value: "successful", disabled: true },
      ],
      description: "Verify payment. Required: tx_ref or txRef.",
    }),
    [
      {
        name: "200 Paid",
        code: 200,
        body: {
          success: true,
          order: { ...ORDER, paymentStatus: "paid" },
          paid: true,
        },
      },
      {
        name: "200 Already paid",
        code: 200,
        body: { success: true, order: ORDER, alreadyPaid: true },
      },
    ]
  ),
  addResponses(
    req("POST", "payments/retry/{{orderId}}", {
      auth: true,
      description: "Retry pending card order checkout.",
    }),
    [
      {
        name: "200",
        code: 200,
        body: {
          success: true,
          order: ORDER,
          checkoutUrl: "https://checkout.flutterwave.com/...",
          txRef: "NC-TX-REF-002",
        },
      },
    ]
  ),
]);

const webhooksFolder = folder(
  "Webhooks",
  "Header `verif-hash` (or Verif-Hash / x-flutterwave-signature) must equal FLUTTERWAVE_WEBHOOK_SECRET.",
  [
    addResponses(
      req("POST", "webhooks/flutterwave", {
        auth: false,
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "verif-hash", value: "{{flutterwaveWebhookSecret}}" },
        ],
        body: {
          event: "charge.completed",
          data: {
            id: 123456,
            tx_ref: "{{txRef}}",
            status: "successful",
            amount: 978,
            currency: "ETB",
          },
        },
        description: "Flutterwave webhook. Always returns 200 when accepted.",
      }),
      [
        {
          name: "200 Received",
          code: 200,
          body: { received: true, handled: true },
        },
        {
          name: "401 Unauthorized",
          code: 401,
          body: { success: false, message: "Unauthorized webhook" },
        },
      ]
    ),
  ]
);

const collection = {
  info: {
    _postman_id: uid(),
    name: "NileCart API",
    description: [
      "# NileCart Server API",
      "",
      "**Base URL:** `{{baseUrl}}` → `http://localhost:5000/api`",
      "",
      "## Conventions",
      "- Success: `{ success: true, ... }` (201 on creates where noted)",
      "- Error: `{ success: false, message }` — 400 / 401 / 403 / 404 / 409 / 502 / 503",
      "- Auth: `Authorization: Bearer {{token}}` or httpOnly cookie `token`",
      "- Roles: `customer` | `seller` | `admin`",
      "- Image objects: `{ url, key }`",
      "",
      "## Auth cheat-sheet",
      "1. Customer: `POST /auth/send-otp` → `POST /auth/verify-otp` (token auto-saved)",
      "2. Seller: register → verify OTP → `POST /auth/login/seller`",
      "3. Seller/Admin OTP: `POST /auth/dashboard/send-otp` → verify",
      "",
      "`/auth/*` and `/users/*` are the same routes.",
      "",
      "Import `NileCart-Local.postman_environment.json` and select it before running.",
    ].join("\n"),
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: bearerAuth(),
  variable: [
    { key: "baseUrl", value: "http://localhost:5000/api" },
    { key: "token", value: "" },
    { key: "customerEmail", value: "customer@example.com" },
    { key: "sellerEmail", value: "seller@example.com" },
    { key: "adminEmail", value: "admin@example.com" },
    { key: "password", value: "password123" },
    { key: "otp", value: "123456" },
    { key: "userId", value: "" },
    { key: "userRole", value: "" },
    { key: "sellerId", value: "" },
    { key: "storeSlug", value: "nile-closet" },
    { key: "productId", value: "" },
    { key: "productSlug", value: "classic-cotton-tee" },
    { key: "variantSku", value: "TEE-BLK-M" },
    { key: "categoryId", value: "" },
    { key: "categorySlug", value: "dresses" },
    { key: "cartItemId", value: "" },
    { key: "addressId", value: "" },
    { key: "orderId", value: "" },
    { key: "couponId", value: "" },
    { key: "bannerId", value: "" },
    { key: "announcementId", value: "" },
    { key: "homeSectionId", value: "" },
    { key: "campaignId", value: "" },
    { key: "collectionId", value: "" },
    { key: "collectionSlug", value: "essentials" },
    { key: "flashSaleId", value: "" },
    { key: "brandId", value: "" },
    { key: "reviewId", value: "" },
    { key: "txRef", value: "" },
    { key: "flutterwaveWebhookSecret", value: "" },
  ],
  item: [
    folder("Health", "", [health]),
    authFolder,
    sellersFolder,
    adminFolder,
    categoriesFolder,
    productsFolder,
    marketingFolder,
    cartFolder,
    wishlistFolder,
    addressesFolder,
    ordersFolder,
    couponsFolder,
    reviewsFolder,
    uploadsFolder,
    paymentsFolder,
    webhooksFolder,
  ],
};

const environment = {
  id: uid(),
  name: "NileCart Local",
  values: [
    { key: "baseUrl", value: "http://localhost:5000/api", type: "default", enabled: true },
    { key: "token", value: "", type: "secret", enabled: true },
    { key: "customerEmail", value: "customer@example.com", type: "default", enabled: true },
    { key: "sellerEmail", value: "seller@example.com", type: "default", enabled: true },
    { key: "adminEmail", value: "admin@example.com", type: "default", enabled: true },
    { key: "password", value: "password123", type: "secret", enabled: true },
    { key: "otp", value: "123456", type: "default", enabled: true },
    { key: "flutterwaveWebhookSecret", value: "", type: "secret", enabled: true },
  ],
  _postman_variable_scope: "environment",
};

writeFileSync(
  join(__dirname, "NileCart-API.postman_collection.json"),
  JSON.stringify(collection, null, 2)
);
writeFileSync(
  join(__dirname, "NileCart-Local.postman_environment.json"),
  JSON.stringify(environment, null, 2)
);

console.log("Wrote NileCart-API.postman_collection.json");
console.log("Wrote NileCart-Local.postman_environment.json");
