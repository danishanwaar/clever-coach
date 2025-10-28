# Clever Coach Database Migration

This document provides instructions for migrating data from the legacy PHP MySQL database to the new Supabase PostgreSQL database.

## Overview

The migration script handles:
- ✅ Foreign key dependency resolution
- ✅ Data type transformations (MySQL → PostgreSQL)
- ✅ Table renames (e.g., `tbl_t000` → `tbl_system_config`)
- ✅ Enum value mappings
- ✅ Batch processing for large datasets
- ✅ Error handling and rollback capabilities
- ✅ Progress tracking

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** database with legacy data
3. **Supabase** project with target schema
4. **Network access** to both databases

## Setup

### 1. Install Dependencies

```bash
# Install migration dependencies
npm install mysql2 dotenv
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.migration.example .env

# Edit .env with your database credentials
nano .env
```

### 3. Database Preparation

#### MySQL (Source)
- Ensure the legacy database is accessible
- Verify all tables exist with data
- Check for any data integrity issues

#### Supabase (Target)
- Ensure all tables are created with proper schema
- Verify foreign key constraints are in place
- Run any necessary migrations first

## Migration Process

### 1. Dry Run (Recommended)

```bash
# Test the migration without making changes
npm run migrate:dry-run
```

### 2. Full Migration

```bash
# Run the complete migration
npm run migrate
```

### 3. Verification

After migration, verify:
- Record counts match between source and target
- Foreign key relationships are intact
- Data types are correctly transformed
- No data loss occurred

## Migration Order

The script processes tables in dependency order:

1. **Base Tables** (no dependencies)
   - `tbl_roles`
   - `tbl_countries`
   - `tbl_activities_types`
   - `tbl_educational`
   - `tbl_lesson_durations`
   - `tbl_levels`
   - `tbl_subjects`
   - `tbl_su_types`
   - `tbl_degrees`
   - `tbl_reasons`
   - `tbl_delete_reasons`
   - `tbl_source`
   - `tbl_urls`

2. **System Configuration**
   - `tbl_system_config` (renamed from `tbl_t000`)

3. **Mediation Types**
   - `tbl_mediation_types`

4. **Users**
   - `tbl_users`

5. **Students & Teachers**
   - `tbl_students`
   - `tbl_teachers`

6. **Relationships**
   - `tbl_students_subjects`
   - `tbl_teachers_subjects_expertise`

7. **Contracts**
   - `tbl_contracts`
   - `tbl_contracts_engagement`

8. **Activities**
   - `tbl_activity_applicants`
   - `tbl_activity_matcher`
   - `tbl_activity_students`
   - `tbl_activity_teacher`
   - `tbl_users_activities`

9. **Mediation & Relationships**
   - `tbl_students_mediation_stages`
   - `tbl_teachers_students_activity`
   - `tbl_teachers_students_notes`
   - `tbl_teachers_lessons_history`
   - `tbl_teachers_unavailability_history`

10. **Documents**
    - `tbl_students_documents`
    - `tbl_teachers_documents`
    - `tbl_teacher_documents`

11. **Invoices**
    - `tbl_students_invoices`
    - `tbl_teachers_invoices`
    - `tbl_students_invoices_detail`
    - `tbl_teachers_invoices_detail`
    - `tbl_temp_students_invoices_detail`

12. **Logs**
    - `tbl_contracts_log`
    - `tbl_users_time_log`

## Data Transformations

### Field Mappings

| Legacy Field | Target Field | Transformation |
|--------------|--------------|----------------|
| `FLD_ID` | `fld_id` | Direct mapping |
| `FLD_*` | `fld_*` | Converted to lowercase |
| `FLD_EDATE` | `fld_edate` | DateTime → Timestamp |
| `FLD_DOB` | `fld_dob` | Date → Date |
| `FLD_IS_*` | `fld_is_*` | Y/N → Boolean |
| `FLD_STATUS` | `fld_status` | Enum mapping |

### Table Renames

| Legacy Table | Target Table |
|--------------|--------------|
| `tbl_t000` | `tbl_system_config` |

### Data Type Conversions

- **MySQL DateTime** → **PostgreSQL Timestamp**
- **MySQL TinyInt(1)** → **PostgreSQL Boolean**
- **MySQL Enum** → **PostgreSQL Enum**
- **MySQL Decimal** → **PostgreSQL Numeric**

## Error Handling

The script includes comprehensive error handling:

- **Connection failures**: Automatic retry with exponential backoff
- **Data validation**: Type checking and constraint validation
- **Batch processing**: Individual batch failures don't stop migration
- **Rollback capability**: Can be run multiple times safely
- **Progress tracking**: Real-time progress updates

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Increase timeout in .env
   MYSQL_TIMEOUT=60000
   ```

2. **Memory Issues**
   ```bash
   # Reduce batch size
   BATCH_SIZE=50
   ```

3. **Foreign Key Violations**
   ```bash
   # Check dependency order
   # Verify all referenced records exist
   ```

4. **Data Type Mismatches**
   ```bash
   # Review transformation functions
   # Check enum mappings
   ```

### Debug Mode

```bash
# Enable detailed logging
DEBUG=true npm run migrate
```

## Performance Optimization

### Batch Processing
- Default batch size: 100 records
- Configurable via `BATCH_SIZE` environment variable
- Larger batches = faster processing, more memory usage

### Parallel Processing
- Tables are processed sequentially to maintain dependencies
- Within each table, batches can be processed in parallel
- Adjust based on database connection limits

### Memory Management
- Large tables are processed in chunks
- Memory usage is monitored and optimized
- Garbage collection is triggered between batches

## Rollback

If migration fails or needs to be rolled back:

1. **Stop the migration process**
2. **Clear target tables** (if needed)
3. **Fix the issue**
4. **Restart migration**

The script is idempotent and can be run multiple times safely.

## Monitoring

### Progress Tracking
- Real-time progress updates
- Table-by-table completion status
- Error reporting and logging
- Performance metrics

### Logging
- Detailed logs for each operation
- Error tracking and reporting
- Performance metrics
- Data validation results

## Support

For issues or questions:
1. Check the logs for specific error messages
2. Verify database connectivity
3. Ensure all prerequisites are met
4. Review the migration order and dependencies

## Post-Migration

After successful migration:

1. **Verify data integrity**
2. **Test application functionality**
3. **Update application configuration**
4. **Monitor system performance**
5. **Backup the migrated database**

## Security Considerations

- Use service role keys for Supabase (not anon keys)
- Secure database connections with SSL
- Limit network access to necessary IPs
- Monitor for unauthorized access attempts
- Encrypt sensitive data in transit

## Performance Metrics

Expected migration times (approximate):
- Small database (< 10K records): 5-10 minutes
- Medium database (10K-100K records): 30-60 minutes
- Large database (> 100K records): 2-4 hours

Times may vary based on:
- Network latency
- Database performance
- Data complexity
- Server resources
