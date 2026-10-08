using GoFund.Domain.Entities;
using GoFund.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;

namespace GoFund.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        public DbSet<TwoFactorLoginChallenge> TwoFactorLoginChallenges { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.TokenHash)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(x => x.ReplacedByTokenHash)
                    .HasMaxLength(500);

                entity.HasIndex(x => x.TokenHash)
                    .IsUnique();

                entity.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TwoFactorLoginChallenge>(entity =>
            {

                entity.HasKey(x => x.Id);

                entity.Property(x => x.UserId)
                    .IsRequired();

                entity.Property(x => x.CreatedAtUtc)
                    .IsRequired();

                entity.Property(x => x.ExpiresAtUtc)
                    .IsRequired();

                entity.Property(x => x.FailedAttempts)
                    .IsRequired();

                entity.Property(x => x.IsUsed)
                    .IsRequired();

                entity.HasIndex(x => x.UserId);

                entity.HasIndex(x => new
                {
                    x.UserId,
                    x.IsUsed
                });
        });

        }
    }
}
