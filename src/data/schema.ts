import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  date,
  time,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";


/* =========================================================
   ENUMS
========================================================= */

export const userRoleEnum = pgEnum("user_role", [
  "USER",
  "FACILITY_OWNER",
  "ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "BANNED",
  "SUSPENDED",
]);

export const facilityStatusEnum = pgEnum("facility_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const courtStatusEnum = pgEnum("court_status", [
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const sportEnum = pgEnum("sport", [
  "BADMINTON",
  "FOOTBALL",
  "CRICKET",
  "TENNIS",
  "BASKETBALL",
  "TABLE_TENNIS",
  "VOLLEYBALL",
]);


/* =========================================================
   USERS
========================================================= */

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    email: varchar("email", {
      length: 255,
    }).notNull(),

    passwordHash: text("password_hash")
      .notNull(),

    avatarUrl: text("avatar_url"),

    role: userRoleEnum("role")
      .default("USER")
      .notNull(),

    status: userStatusEnum("status")
      .default("ACTIVE")
      .notNull(),

    emailVerified: boolean("email_verified")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    emailUnique: uniqueIndex(
      "users_email_unique"
    ).on(table.email),

    roleIndex: index(
      "users_role_idx"
    ).on(table.role),

    statusIndex: index(
      "users_status_idx"
    ).on(table.status),
  })
);


/* =========================================================
   OTP VERIFICATIONS
========================================================= */

export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    code: varchar("code", {
      length: 6,
    }).notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
    }),

    attempts: integer("attempts")
      .default(0)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    userIndex: index(
      "otp_user_idx"
    ).on(table.userId),

    expiryIndex: index(
      "otp_expiry_idx"
    ).on(table.expiresAt),
  })
);


/* =========================================================
   FACILITIES
========================================================= */

export const facilities = pgTable(
  "facilities",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    description: text("description"),

    address: text("address")
      .notNull(),

    city: varchar("city", {
      length: 100,
    }).notNull(),

    state: varchar("state", {
      length: 100,
    }),

    postalCode: varchar("postal_code", {
      length: 20,
    }),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7,
    }),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7,
    }),

    phone: varchar("phone", {
      length: 30,
    }),

    status: facilityStatusEnum("status")
      .default("PENDING")
      .notNull(),

    rejectionReason: text(
      "rejection_reason"
    ),

    amenities: jsonb("amenities")
      .$type<string[]>()
      .default([])
      .notNull(),

    images: jsonb("images")
      .$type<string[]>()
      .default([])
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    ownerIndex: index(
      "facilities_owner_idx"
    ).on(table.ownerId),

    statusIndex: index(
      "facilities_status_idx"
    ).on(table.status),

    cityIndex: index(
      "facilities_city_idx"
    ).on(table.city),
  })
);


/* =========================================================
   FACILITY SPORTS
========================================================= */

export const facilitySports = pgTable(
  "facility_sports",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, {
        onDelete: "cascade",
      }),

    sport: sportEnum("sport")
      .notNull(),
  },

  (table) => ({
    uniqueFacilitySport: uniqueIndex(
      "facility_sport_unique"
    ).on(
      table.facilityId,
      table.sport
    ),
  })
);


/* =========================================================
   COURTS
========================================================= */

export const courts = pgTable(
  "courts",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    sport: sportEnum("sport")
      .notNull(),

    pricePerHour: numeric(
      "price_per_hour",
      {
        precision: 10,
        scale: 2,
      }
    ).notNull(),

    openingTime: time(
      "opening_time"
    ).notNull(),

    closingTime: time(
      "closing_time"
    ).notNull(),

    status: courtStatusEnum("status")
      .default("ACTIVE")
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    facilityIndex: index(
      "courts_facility_idx"
    ).on(table.facilityId),

    sportIndex: index(
      "courts_sport_idx"
    ).on(table.sport),

    statusIndex: index(
      "courts_status_idx"
    ).on(table.status),
  })
);


/* =========================================================
   COURT BLOCKS
========================================================= */

export const courtBlocks = pgTable(
  "court_blocks",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    courtId: uuid("court_id")
      .notNull()
      .references(() => courts.id, {
        onDelete: "cascade",
      }),

    blockDate: date(
      "block_date"
    ).notNull(),

    startTime: time(
      "start_time"
    ).notNull(),

    endTime: time(
      "end_time"
    ).notNull(),

    reason: varchar("reason", {
      length: 255,
    }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    courtDateIndex: index(
      "court_blocks_court_date_idx"
    ).on(
      table.courtId,
      table.blockDate
    ),
  })
);


/* =========================================================
   BOOKINGS
========================================================= */

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    bookingReference: varchar(
      "booking_reference",
      {
        length: 20,
      }
    ).notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, {
        onDelete: "restrict",
      }),

    courtId: uuid("court_id")
      .notNull()
      .references(() => courts.id, {
        onDelete: "restrict",
      }),

    sport: sportEnum("sport")
      .notNull(),

    bookingDate: date(
      "booking_date"
    ).notNull(),

    startTime: time(
      "start_time"
    ).notNull(),

    endTime: time(
      "end_time"
    ).notNull(),

    amount: numeric("amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    bookingStatus: bookingStatusEnum(
      "booking_status"
    )
      .default("CONFIRMED")
      .notNull(),

    paymentStatus: paymentStatusEnum(
      "payment_status"
    )
      .default("PENDING")
      .notNull(),

    cancelledAt: timestamp(
      "cancelled_at",
      {
        withTimezone: true,
      }
    ),

    cancellationReason: text(
      "cancellation_reason"
    ),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    referenceUnique: uniqueIndex(
      "booking_reference_unique"
    ).on(table.bookingReference),

    /*
      IMPORTANT:
      For the hackathon use fixed 1-hour slots.
      This prevents the same court from being
      booked twice for the same date/start time.
    */
    bookingSlotUnique: uniqueIndex(
      "booking_slot_unique"
    ).on(
      table.courtId,
      table.bookingDate,
      table.startTime
    ),

    userIndex: index(
      "bookings_user_idx"
    ).on(table.userId),

    facilityIndex: index(
      "bookings_facility_idx"
    ).on(table.facilityId),

    courtDateIndex: index(
      "bookings_court_date_idx"
    ).on(
      table.courtId,
      table.bookingDate
    ),

    dateIndex: index(
      "bookings_date_idx"
    ).on(table.bookingDate),

    statusIndex: index(
      "bookings_status_idx"
    ).on(table.bookingStatus),
  })
);


/* =========================================================
   PAYMENTS
========================================================= */

export const payments = pgTable(
  "payments",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    amount: numeric("amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    status: paymentStatusEnum(
      "status"
    )
      .default("PENDING")
      .notNull(),

    provider: varchar("provider", {
      length: 50,
    })
      .default("SIMULATED"),

    transactionId: varchar(
      "transaction_id",
      {
        length: 255,
      }
    ),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    bookingUnique: uniqueIndex(
      "payment_booking_unique"
    ).on(table.bookingId),

    transactionIndex: index(
      "payments_transaction_idx"
    ).on(table.transactionId),
  })
);


/* =========================================================
   REVIEWS
========================================================= */

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, {
        onDelete: "cascade",
      }),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    rating: integer(
      "rating"
    ).notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    oneReviewPerBooking: uniqueIndex(
      "review_booking_unique"
    ).on(table.bookingId),

    facilityIndex: index(
      "reviews_facility_idx"
    ).on(table.facilityId),
  })
);


/* =========================================================
   RELATIONS
========================================================= */

export const usersRelations = relations(
  users,
  ({ many }) => ({
    otpVerifications: many(
      otpVerifications
    ),

    facilities: many(
      facilities
    ),

    bookings: many(
      bookings
    ),

    reviews: many(
      reviews
    ),

    courtBlocks: many(
      courtBlocks
    ),
  })
);


export const otpVerificationsRelations =
  relations(
    otpVerifications,
    ({ one }) => ({
      user: one(users, {
        fields: [
          otpVerifications.userId,
        ],
        references: [
          users.id,
        ],
      }),
    })
  );


export const facilitiesRelations =
  relations(
    facilities,
    ({ one, many }) => ({
      owner: one(users, {
        fields: [
          facilities.ownerId,
        ],
        references: [
          users.id,
        ],
      }),

      sports: many(
        facilitySports
      ),

      courts: many(
        courts
      ),

      bookings: many(
        bookings
      ),

      reviews: many(
        reviews
      ),
    })
  );


export const facilitySportsRelations =
  relations(
    facilitySports,
    ({ one }) => ({
      facility: one(
        facilities,
        {
          fields: [
            facilitySports.facilityId,
          ],
          references: [
            facilities.id,
          ],
        }
      ),
    })
  );


export const courtsRelations =
  relations(
    courts,
    ({ one, many }) => ({
      facility: one(
        facilities,
        {
          fields: [
            courts.facilityId,
          ],
          references: [
            facilities.id,
          ],
        }
      ),

      blocks: many(
        courtBlocks
      ),

      bookings: many(
        bookings
      ),
    })
  );


export const courtBlocksRelations =
  relations(
    courtBlocks,
    ({ one }) => ({
      court: one(
        courts,
        {
          fields: [
            courtBlocks.courtId,
          ],
          references: [
            courts.id,
          ],
        }
      ),

      createdByUser: one(
        users,
        {
          fields: [
            courtBlocks.createdBy,
          ],
          references: [
            users.id,
          ],
        }
      ),
    })
  );


export const bookingsRelations =
  relations(
    bookings,
    ({ one }) => ({
      user: one(
        users,
        {
          fields: [
            bookings.userId,
          ],
          references: [
            users.id,
          ],
        }
      ),

      facility: one(
        facilities,
        {
          fields: [
            bookings.facilityId,
          ],
          references: [
            facilities.id,
          ],
        }
      ),

      court: one(
        courts,
        {
          fields: [
            bookings.courtId,
          ],
          references: [
            courts.id,
          ],
        }
      ),

      payment: one(
        payments
      ),

      review: one(
        reviews
      ),
    })
  );


export const paymentsRelations =
  relations(
    payments,
    ({ one }) => ({
      booking: one(
        bookings,
        {
          fields: [
            payments.bookingId,
          ],
          references: [
            bookings.id,
          ],
        }
      ),
    })
  );


export const reviewsRelations =
  relations(
    reviews,
    ({ one }) => ({
      user: one(
        users,
        {
          fields: [
            reviews.userId,
          ],
          references: [
            users.id,
          ],
        }
      ),

      facility: one(
        facilities,
        {
          fields: [
            reviews.facilityId,
          ],
          references: [
            facilities.id,
          ],
        }
      ),

      booking: one(
        bookings,
        {
          fields: [
            reviews.bookingId,
          ],
          references: [
            bookings.id,
          ],
        }
      ),
    })
  );
