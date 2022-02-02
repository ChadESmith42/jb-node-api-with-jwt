-- CREATE TABLES

-- Users
CREATE TABLE "users" (
	"id" serial NOT NULL,
	"username" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"avatar_link" varchar(255),
	"firstName" varchar(255),
	"lastName" varchar(255),
	"email" varchar(255),
	"role" varchar(100) NOT NULL DEFAULT 'user',
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- Pets
CREATE TABLE "pets" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"breed" varchar(100) NOT NULL,
	"birthday" date NOT NULL,
	"weight" integer NOT NULL,
	"height" integer NOT NULL,
	"primary_color" varchar(100) NOT NULL,
	"secondary_color" varchar(100) DEFAULT NULL,
	"date_registered" TIMESTAMP NOT NULL DEFAULT 'Now()'
) WITH (
  OIDS=FALSE
);

-- Pets Owners Lookup Table
CREATE TABLE "pets_owners" (
	"id" serial NOT NULL,
	"users_id" int NOT NULL,
	"pets_id" int NOT NULL,
	CONSTRAINT "pets_owners_pk" PRIMARY KEY ("id"),
	CONSTRAINT "pets_owners_fk0" FOREIGN KEY ("users_id") REFERENCES "users"("id"),
	CONSTRAINT "pets_owners_fk1" FOREIGN KEY ("pets_id") REFERENCES "pets"("id")
) WITH (
  OIDS=FALSE
);

-- Resorts
CREATE TABLE "resorts" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zipCode" varchar(12) NOT NULL,
	"latitude" decimal,
	"longitude" decimal,
	CONSTRAINT "resorts_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- Resorts Hours
CREATE TABLE "resorts_hours" (
	"id" serial NOT NULL,
	"day" varchar(10) NOT NULL,
	"startTime" time NOT NULL,
	"stopTime" time NOT NULL,
	"capacity" integer NOT NULL DEFAULT 25,
	CONSTRAINT "resorts_hours_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);


-- Reservations
CREATE TABLE "reservations" (
	"id" serial NOT NULL,
	"pets_id" int NOT NULL,
	"owners_id" int NOT NULL,
	"resorts_id" int NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "reservations_pk" PRIMARY KEY ("id"),
	CONSTRAINT "reservations_fk0" FOREIGN KEY ("owners_id") REFERENCES "users"("id"),
	CONSTRAINT "reservations_fk1" FOREIGN KEY ("pets_id") REFERENCES "pets"("id"),
	CONSTRAINT "reservations_fk2" FOREIGN KEY ("resorts_id") REFERENCES "resorts"("id")
) WITH (
  OIDS=FALSE
);

-- Employees
CREATE TABLE "employees" (
	"id" serial NOT NULL,
	"users_id" int NOT NULL,
	"hire_date" date NOT NULL,
	"title" varchar(100) NOT NULL,
	CONSTRAINT "employees_pk" PRIMARY KEY ("id"),
	CONSTRAINT "employees_fk0" FOREIGN KEY ("users_id") REFERENCES "users"("id")
);

-- Pet Notes
CREATE TABLE "notes" (
	"id" serial NOT NULL,
	"users_id" int NOT NULL,
	"pets_id" int NOT NULL,
	"note" text,
	"date" date NOT NULL,
	CONSTRAINT "notes_pk" PRIMARY KEY ("id"),
	CONSTRAINT "notes_fk0" FOREIGN KEY ("users_id") REFERENCES "users"("id"),
	CONSTRAINT "notes_fk1" FOREIGN KEY ("pets_id") REFERENCES "pets"("id")
) WITH (
  OIDS=FALSE
);
