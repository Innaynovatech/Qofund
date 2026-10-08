using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoFund.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTwoFactorLoginChallenges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TwoFactorLoginChallenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FailedAttempts = table.Column<int>(type: "int", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UsedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TwoFactorLoginChallenges", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TwoFactorLoginChallenges_UserId",
                table: "TwoFactorLoginChallenges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TwoFactorLoginChallenges_UserId_IsUsed",
                table: "TwoFactorLoginChallenges",
                columns: new[] { "UserId", "IsUsed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TwoFactorLoginChallenges");
        }
    }
}
