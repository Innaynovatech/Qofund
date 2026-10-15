using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoFund.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailOtpToTwoFactorLoginChallenge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastOtpSentAtUtc",
                table: "TwoFactorLoginChallenges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OtpExpiresAtUtc",
                table: "TwoFactorLoginChallenges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtpHash",
                table: "TwoFactorLoginChallenges",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastOtpSentAtUtc",
                table: "TwoFactorLoginChallenges");

            migrationBuilder.DropColumn(
                name: "OtpExpiresAtUtc",
                table: "TwoFactorLoginChallenges");

            migrationBuilder.DropColumn(
                name: "OtpHash",
                table: "TwoFactorLoginChallenges");
        }
    }
}
