CREATE DATABASE LinguaHub;
GO
USE LinguaHub;
GO

-- ============================================
-- 1. USERS TABLE (Authentication)
-- ============================================
CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL CHECK (Role IN ('admin', 'teacher', 'student')),
    IsAdmin BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================
-- 2. TEACHERS TABLE
-- ============================================
CREATE TABLE dbo.Teachers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Phone NVARCHAR(20),
    Qualification NVARCHAR(200),
    JoinDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);
GO

-- ============================================
-- 3. STUDENTS TABLE
-- ============================================
CREATE TABLE dbo.Students (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Phone NVARCHAR(20),
    JoinDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);
GO

-- ============================================
-- 4. CLASSES TABLE
-- ============================================
CREATE TABLE dbo.Classes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    MainTeacherId INT NOT NULL,
    StartDate DATETIME2,
    EndDate DATETIME2,
    MaxStudents INT DEFAULT 30,
    Fee DECIMAL(18,2) DEFAULT 3500000,
    Schedule NVARCHAR(100),
    Room NVARCHAR(50),
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (MainTeacherId) REFERENCES dbo.Teachers(Id)
);
GO

-- ============================================
-- 5. CLASS_STUDENTS (Many-to-Many)
-- ============================================
CREATE TABLE dbo.ClassStudents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClassId INT NOT NULL,
    StudentId INT NOT NULL,
    JoinDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (ClassId) REFERENCES dbo.Classes(Id) ON DELETE CASCADE,
    FOREIGN KEY (StudentId) REFERENCES dbo.Students(Id) ON DELETE CASCADE,
    UNIQUE (ClassId, StudentId)
);
GO

-- ============================================
-- 6. ATTENDANCE TABLE
-- ============================================
CREATE TABLE dbo.Attendance (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClassId INT NOT NULL,
    StudentId INT NOT NULL,
    AttendanceDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('present', 'absent', 'late', 'excused')),
    Note NVARCHAR(500),
    RecordedBy INT,
    RecordedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ClassId) REFERENCES dbo.Classes(Id),
    FOREIGN KEY (StudentId) REFERENCES dbo.Students(Id),
    FOREIGN KEY (RecordedBy) REFERENCES dbo.Teachers(Id)
);
GO

-- ============================================
-- 8. TUITION TABLE (Học phí)
-- ============================================
CREATE TABLE dbo.Tuition (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL,
    ClassId INT NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL DEFAULT 3500000,
    DueDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (Status IN ('paid', 'unpaid', 'pending')),
    PaidDate DATE,
    Note NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (StudentId) REFERENCES dbo.Students(Id),
    FOREIGN KEY (ClassId) REFERENCES dbo.Classes(Id)
);
GO

-- ============================================
-- 7. SCORES TABLE
-- ============================================
CREATE TABLE dbo.Scores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL,
    ClassId INT NOT NULL,
    ExamName NVARCHAR(100),
    Score DECIMAL(5, 2),
    MaxScore DECIMAL(5, 2) DEFAULT 100,
    RecordedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Note NVARCHAR(500),
    RecordedBy INT,
    FOREIGN KEY (StudentId) REFERENCES dbo.Students(Id),
    FOREIGN KEY (ClassId) REFERENCES dbo.Classes(Id),
    FOREIGN KEY (RecordedBy) REFERENCES dbo.Teachers(Id)
);
GO

-- ============================================
-- 8. TUITION TABLE (Học phí)
-- ============================================
CREATE TABLE dbo.Tuition (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL,
    ClassId INT NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL DEFAULT 3500000,
    DueDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (Status IN ('paid', 'unpaid', 'pending')),
    PaidDate DATE,
    Note NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (StudentId) REFERENCES dbo.Students(Id),
    FOREIGN KEY (ClassId) REFERENCES dbo.Classes(Id)
);
GO

-- ============================================
-- SEED DATA
-- ============================================

-- Users: 1 Admin, 2 Teachers, 5 Students
INSERT INTO dbo.Users (FullName, Email, Username, PasswordHash, Role, IsAdmin)
VALUES 
    ('System Admin', 'admin@linguahub.local', 'admin', '123456', 'admin', 1),
    ('Ms. Lan Nguyễn', 'lan@linguahub.local', 'lan', '123456', 'teacher', 0),
    ('Mr. Hùng Trần', 'hung@linguahub.local', 'hung', '123456', 'teacher', 0),
    ('Nguyễn Văn A', 'nguyenvana@linguahub.local', 'nguyenvana', '123456', 'student', 0),
    ('Nguyễn Văn B', 'nguyenvanb@linguahub.local', 'nguyenvanb', '123456', 'student', 0),
    ('Trần Văn C', 'tranvanc@linguahub.local', 'tranvanc', '123456', 'student', 0),
    ('Phạm Thị D', 'phamthid@linguahub.local', 'phamthid', '123456', 'student', 0),
    ('Hoàng Văn E', 'hoangvane@linguahub.local', 'hoangvane', '123456', 'student', 0);
GO

-- Teachers
INSERT INTO dbo.Teachers (UserId, Phone, Qualification, Status)
VALUES 
    (2, '0901234567', 'TOEFL Certified', 'active'),
    (3, '0902345678', 'IELTS Certified', 'active');
GO

-- Students
INSERT INTO dbo.Students (UserId, Phone, Status)
VALUES 
    (4, '0911111111', 'active'),
    (5, '0911111112', 'active'),
    (6, '0911111113', 'active'),
    (7, '0911111114', 'active'),
    (8, '0911111115', 'active');
GO

-- Classes
INSERT INTO dbo.Classes (Name, Code, Description, MainTeacherId, StartDate, EndDate, MaxStudents, Status)
VALUES 
    ('TOEIC 500A', 'TOEIC-500A', 'Lớp luyện thi TOEIC level 500', 1, CAST('2024-01-01' AS DATETIME2), CAST('2024-06-30' AS DATETIME2), 25, 'active'),
    ('TOEIC 600A', 'TOEIC-600A', 'Lớp luyện thi TOEIC level 600', 2, CAST('2024-01-01' AS DATETIME2), CAST('2024-06-30' AS DATETIME2), 25, 'active');
GO

-- ClassStudents
INSERT INTO dbo.ClassStudents (ClassId, StudentId, Status)
VALUES 
    (1, 1, 'active'),
    (1, 2, 'active'),
    (1, 3, 'active'),
    (2, 4, 'active'),
    (2, 5, 'active');
GO

-- Attendance (Today's data)
INSERT INTO dbo.Attendance (ClassId, StudentId, AttendanceDate, Status, RecordedBy)
VALUES 
    (1, 1, CAST(GETDATE() AS DATE), 'present', 1),
    (1, 2, CAST(GETDATE() AS DATE), 'present', 1),
    (1, 3, CAST(GETDATE() AS DATE), 'absent', 1),
    (2, 4, CAST(GETDATE() AS DATE), 'present', 2),
    (2, 5, CAST(GETDATE() AS DATE), 'late', 2);
GO

-- Scores
INSERT INTO dbo.Scores (StudentId, ClassId, ExamName, Score, MaxScore, RecordedBy)
VALUES 
    (1, 1, 'Midterm Test', 78.5, 100, 1),
    (2, 1, 'Midterm Test', 85.0, 100, 1),
    (3, 1, 'Midterm Test', 72.0, 100, 1),
    (4, 2, 'Midterm Test', 90.5, 100, 2),
    (5, 2, 'Midterm Test', 88.0, 100, 2);
GO
